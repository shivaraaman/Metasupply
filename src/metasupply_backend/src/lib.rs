use ic_cdk::api::time;
use ic_cdk_macros::*;  // this now works!
use candid::{CandidType, Deserialize, Principal};
use std::cell::RefCell;
use std::collections::HashMap;

#[derive(CandidType, Deserialize, Clone)]
struct FileMeta {
    filename: String,
    model: String,
    dataset: String,
    prompt: Option<String>,
    timestamp: u64,
    creator: Principal,
    previous_hash: Option<String>,
}

#[derive(CandidType, Deserialize, Clone)]
struct User {
    username: String,
}

#[derive(CandidType, Deserialize)]
struct FileInput {
    filename: String,
    hash: String,
    model: String,
    dataset: String,
    prompt: Option<String>,
    previous_hash: Option<String>,
}

thread_local! {
    static USERS: RefCell<HashMap<Principal, User>> = RefCell::new(HashMap::new());
    static FILES: RefCell<HashMap<String, FileMeta>> = RefCell::new(HashMap::new());
}

#[update]
fn register_user(username: String, _unused: String) -> String {
    let caller = ic_cdk::caller();
    USERS.with(|users| {
        users.borrow_mut().insert(caller, User { username: username.clone() });
    });
    username
}

#[query]
fn get_user(user: Principal) -> Option<User> {
    USERS.with(|users| users.borrow().get(&user).cloned())
}

#[update]
fn upload_file(file: FileInput) {
    let creator = ic_cdk::caller();
    let timestamp = time();

    let meta = FileMeta {
        filename: file.filename,
        model: file.model,
        dataset: file.dataset,
        prompt: file.prompt,
        timestamp,
        creator,
        previous_hash: file.previous_hash,
    };

    FILES.with(|files| {
        files.borrow_mut().insert(file.hash, meta);
    });
}

#[query]
fn search_file(hash: String) -> Option<FileMeta> {
    FILES.with(|files| files.borrow().get(&hash).cloned())
}

#[query]
fn get_all_files() -> Vec<FileMeta> {
    FILES.with(|files| files.borrow().values().cloned().collect())
}
