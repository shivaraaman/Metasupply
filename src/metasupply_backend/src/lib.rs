use candid::{CandidType, Deserialize, Principal};
use ic_cdk::api::{caller, time};
use ic_cdk::{init, post_upgrade, pre_upgrade, query, update};
use std::cell::RefCell;
use std::collections::HashMap;

const MAX_ID_LEN: usize = 128;
const MAX_FILENAME_LEN: usize = 256;
const MAX_MODEL_LEN: usize = 128;
const MAX_DATASET_LEN: usize = 128;
const MAX_PROMPT_LEN: usize = 2048;
const MAX_FILES_PER_USER: usize = 1000;

/// Metadata for one version of a file.
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct FileMetadata {
    /// SHA-256 hash of the metadata, unique per user.
    pub id: String,
    pub filename: String,
    pub model: String,
    pub dataset: String,
    pub prompt: String,
    /// ID of the version this one replaces, if any.
    pub previous_hash: Option<String>,
    pub creator: Principal,
    /// Upload time in nanoseconds since the Unix epoch.
    pub timestamp: u64,
}

type FileStore = HashMap<Principal, Vec<FileMetadata>>;

thread_local! {
    static FILES: RefCell<FileStore> = RefCell::new(HashMap::new());
}

#[init]
fn init() {
    ic_cdk::println!("MetaSupply backend initialized");
}

#[pre_upgrade]
fn pre_upgrade() {
    FILES.with(|files| {
        ic_cdk::storage::stable_save((&*files.borrow(),))
            .expect("failed to save state to stable memory");
    });
}

#[post_upgrade]
fn post_upgrade() {
    match ic_cdk::storage::stable_restore::<(FileStore,)>() {
        Ok((restored,)) => FILES.with(|files| *files.borrow_mut() = restored),
        Err(e) => ic_cdk::println!("No state restored after upgrade: {}", e),
    }
}

fn check_len(field: &str, value: &str, max: usize) -> Result<(), String> {
    if value.trim().is_empty() {
        return Err(format!("{} must not be empty.", field));
    }
    if value.len() > max {
        return Err(format!("{} exceeds the maximum length of {}.", field, max));
    }
    Ok(())
}

/// Stores metadata for a new file (or a new version of one) owned by the caller.
#[update]
fn upload_file(
    id: String,
    filename: String,
    model: String,
    dataset: String,
    prompt: String,
    previous_hash: Option<String>,
) -> Result<String, String> {
    let creator = caller();
    if creator == Principal::anonymous() {
        return Err("You must be logged in to upload files.".to_string());
    }

    check_len("ID", &id, MAX_ID_LEN)?;
    check_len("Filename", &filename, MAX_FILENAME_LEN)?;
    check_len("Model", &model, MAX_MODEL_LEN)?;
    check_len("Dataset", &dataset, MAX_DATASET_LEN)?;
    check_len("Prompt", &prompt, MAX_PROMPT_LEN)?;
    let previous_hash = previous_hash.filter(|ph| !ph.trim().is_empty());
    if let Some(ph) = &previous_hash {
        check_len("Previous hash", ph, MAX_ID_LEN)?;
    }

    FILES.with(|files| {
        let mut files = files.borrow_mut();
        let user_files = files.entry(creator).or_default();

        if user_files.len() >= MAX_FILES_PER_USER {
            return Err(format!(
                "Maximum number of files per user ({}) reached.",
                MAX_FILES_PER_USER
            ));
        }
        if user_files.iter().any(|f| f.id == id) {
            return Err(format!("File with ID {} already exists.", id));
        }
        if let Some(ph) = &previous_hash {
            if !user_files.iter().any(|f| &f.id == ph) {
                return Err(format!("Previous version {} was not found.", ph));
            }
        }

        ic_cdk::println!("File uploaded: id={}, filename={}, creator={}", id, filename, creator);
        let message = format!("File {} uploaded successfully!", id);
        user_files.push(FileMetadata {
            id,
            filename,
            model,
            dataset,
            prompt,
            previous_hash,
            creator,
            timestamp: time(),
        });
        Ok(message)
    })
}

/// Returns every file uploaded by the caller.
#[query]
fn get_all_files() -> Vec<FileMetadata> {
    let creator = caller();
    FILES.with(|files| files.borrow().get(&creator).cloned().unwrap_or_default())
}

ic_cdk::export_candid!();
