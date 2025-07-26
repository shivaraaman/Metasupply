use candid::{CandidType, Deserialize, Principal};
use ic_cdk_macros::*;
use std::collections::HashMap;
use ic_cdk::api::time;

// Define the structure for file metadata
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct FileMetadata {
    pub id: String, // SHA-256 hash of the file content + metadata for uniqueness
    pub filename: String,
    pub model: String,
    pub dataset: String,
    pub prompt: String,
    pub previous_hash: Option<String>, // Link to the previous version
    pub creator: Principal,
    pub timestamp: u64, // Unix timestamp in nanoseconds
}

// Store files mapping Principal (user) to a vector of their FileMetadata
static mut FILES: Option<HashMap<Principal, Vec<FileMetadata>>> = None;

// Initialize the state when the canister is created or upgraded.
#[init]
fn init() {
    unsafe {
        FILES = Some(HashMap::new()); // FIX: Changed HashMap() to HashMap::new()
    }
    ic_cdk::println!("MetaSupply Backend Canister Initialized!");
}

// Post-upgrade hook, similar to init, ensures state is maintained across upgrades.
#[post_upgrade]
fn post_upgrade() {
    unsafe {
        if FILES.is_none() {
            FILES = Some(HashMap::new()); // FIX: Changed HashMap() to HashMap::new()
        }
    }
    ic_cdk::println!("MetaSupply Backend Canister Upgraded!");
}

// Public method to upload file metadata.
#[update]
fn upload_file(
    id: String,
    filename: String,
    model: String,
    dataset: String,
    prompt: String,
    previous_hash: Option<String>,
) -> Result<String, String> {
    let caller = ic_cdk::api::caller();
    let timestamp = time();

    // Clone `id` and `filename` BEFORE they are moved into `new_file`.
    let id_for_log = id.clone();
    let filename_for_log = filename.clone();

    let new_file = FileMetadata {
        id, // Ownership of `id` moves here
        filename, // Ownership of `filename` moves here
        model, // Ownership of `model` moves here
        dataset, // Ownership of `dataset` moves here
        prompt, // Ownership of `prompt` moves here
        previous_hash,
        creator: caller,
        timestamp,
    };

    unsafe {
        let files_map = FILES
            .as_mut()
            .expect("Canister not initialized. Call init() or post_upgrade() first.");

        let user_files = files_map.entry(caller).or_insert_with(Vec::new);

        if user_files.iter().any(|f| f.id == new_file.id) {
            return Err(format!("File with ID {} already exists for this user.", new_file.id));
        }

        user_files.push(new_file);
    }

    // Use the cloned variables for logging, as the originals have been moved.
    ic_cdk::println!("File uploaded: ID={}, Filename={}, Creator={}", id_for_log, filename_for_log, caller);
    // Use the cloned ID for the success message.
    Ok(format!("File {} uploaded successfully!", id_for_log))
}

// Public method to fetch all uploaded files for the calling user.
#[query]
fn get_all_files() -> Vec<FileMetadata> {
    let caller = ic_cdk::api::caller();
    unsafe {
        let files_map = FILES
            .as_ref()
            .expect("Canister not initialized. Call init() or post_upgrade() first.");

        files_map
            .get(&caller)
            .cloned()
            .unwrap_or_else(Vec::new)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn generate_candid() {
        candid::export_service!();
        std::fs::write("metasupply_backend.did", __export_service()).expect("Failed to write .did file");
    }
}
