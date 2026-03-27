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

use std::cell::RefCell;

// Store files mapping Principal (user) to a vector of their FileMetadata
thread_local! {
    static FILES: RefCell<HashMap<Principal, Vec<FileMetadata>>> = RefCell::new(HashMap::new());
}

// Initialize the state when the canister is created or upgraded.
#[init]
fn init() {
    ic_cdk::println!("MetaSupply Backend Canister Initialized!");
}

// Pre-upgrade hook, saves the current state to stable memory before an upgrade.
#[pre_upgrade]
fn pre_upgrade() {
    FILES.with(|files| {
        let current_state = files.borrow().clone();
        if let Err(e) = ic_cdk::storage::stable_save((current_state,)) {
            ic_cdk::println!("Failed to save state to stable memory: {:?}", e);
        }
    });
}

// Post-upgrade hook, restores state from stable memory after an upgrade.
#[post_upgrade]
fn post_upgrade() {
    if let Ok((restored_files,)) = ic_cdk::storage::stable_restore::<(HashMap<Principal, Vec<FileMetadata>>,)>() {
        FILES.with(|files| {
            *files.borrow_mut() = restored_files;
        });
        ic_cdk::println!("MetaSupply Backend Canister Upgraded and state restored!");
    } else {
        ic_cdk::println!("MetaSupply Backend Canister Upgraded but failed to restore state.");
    }
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

    // Security check: Limit input sizes to prevent DoS via storage exhaustion
    if id.len() > 128 || filename.len() > 256 || model.len() > 128 || dataset.len() > 128 || prompt.len() > 2048 {
        return Err("Input fields exceed maximum allowed length.".to_string());
    }

    if let Some(ref ph) = previous_hash {
        if ph.len() > 128 {
            return Err("Previous hash exceeds maximum allowed length.".to_string());
        }
    }

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

    FILES.with(|files| {
        let mut files_map = files.borrow_mut();
        
        let user_files = files_map.entry(caller).or_insert_with(Vec::new);

        // Security check: Cap the number of files a single user can upload
        if user_files.len() >= 1000 {
            return Err("Maximum number of files per user (1000) reached.".to_string());
        }

        if user_files.iter().any(|f| f.id == new_file.id) {
            return Err(format!("File with ID {} already exists for this user.", new_file.id));
        }

        user_files.push(new_file);
        Ok(())
    })?;

    // Use the cloned variables for logging, as the originals have been moved.
    ic_cdk::println!("File uploaded: ID={}, Filename={}, Creator={}", id_for_log, filename_for_log, caller);
    // Use the cloned ID for the success message.
    Ok(format!("File {} uploaded successfully!", id_for_log))
}

// Public method to fetch all uploaded files for the calling user.
#[query]
fn get_all_files() -> Vec<FileMetadata> {
    let caller = ic_cdk::api::caller();
    FILES.with(|files| {
        files
            .borrow()
            .get(&caller)
            .cloned()
            .unwrap_or_else(Vec::new)
    })
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
