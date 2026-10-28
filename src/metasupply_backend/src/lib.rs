//! MetaSupply: a public, append-only registry of file fingerprints.
//!
//! The browser computes the SHA-256 hash of a file and registers it here together with a
//! title, author and the Internet Computer's timestamp. Records can never be edited or
//! deleted. A new version of a file is registered as a new record that points to the
//! previous one, so anyone holding any version can see the whole history.

use candid::{CandidType, Decode, Deserialize, Encode, Principal};
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::storable::Bound;
use ic_stable_structures::{DefaultMemoryImpl, StableBTreeMap, Storable};
use std::borrow::Cow;
use std::cell::RefCell;

const MAX_TITLE_LEN: usize = 200;
const MAX_AUTHOR_LEN: usize = 100;
const MAX_DESCRIPTION_LEN: usize = 2000;
const MAX_FILE_NAME_LEN: usize = 255;
const MAX_DOCUMENTS_PER_OWNER: usize = 1000;

/// A registered file. Records are never changed once stored.
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq)]
pub struct Document {
    /// SHA-256 of the file contents as 64 lowercase hex characters.
    pub hash: String,
    pub title: String,
    /// Author name as entered by the owner; not verified.
    pub author: String,
    pub description: String,
    pub file_name: String,
    pub file_size: u64,
    /// Internet Identity principal that registered the file.
    pub owner: Principal,
    /// Nanoseconds since the Unix epoch, from the Internet Computer's clock.
    pub registered_at: u64,
    /// Hash of the version this one replaces.
    pub previous_hash: Option<String>,
    /// 1 for the original, increasing by one with each new version.
    pub version: u32,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct RegisterArgs {
    pub hash: String,
    pub title: String,
    pub author: String,
    pub description: String,
    pub file_name: String,
    pub file_size: u64,
    pub previous_hash: Option<String>,
}

#[derive(CandidType, Deserialize, Clone, Debug, PartialEq)]
pub enum RegisterError {
    /// This exact file is already on record.
    AlreadyRegistered(Document),
    Rejected(String),
}

impl Storable for Document {
    fn to_bytes(&self) -> Cow<'_, [u8]> {
        Cow::Owned(Encode!(self).expect("failed to encode document"))
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).expect("failed to decode document")
    }

    const BOUND: Bound = Bound::Unbounded;
}

type Memory = VirtualMemory<DefaultMemoryImpl>;

// Stable structures keep their data in stable memory, so records survive canister upgrades.
thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    /// hash -> document
    static DOCUMENTS: RefCell<StableBTreeMap<String, Document, Memory>> =
        RefCell::new(StableBTreeMap::init(memory(0)));

    /// hash -> hash of the version that replaced it
    static NEXT_VERSION: RefCell<StableBTreeMap<String, String, Memory>> =
        RefCell::new(StableBTreeMap::init(memory(1)));

    /// "<owner>/<registered_at>/<hash>" -> (), to list an owner's documents in order
    static BY_OWNER: RefCell<StableBTreeMap<String, (), Memory>> =
        RefCell::new(StableBTreeMap::init(memory(2)));
}

fn memory(id: u8) -> Memory {
    MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(id)))
}

fn normalize_hash(hash: &str) -> Result<String, String> {
    let hash = hash.trim().to_ascii_lowercase();
    if hash.len() == 64 && hash.bytes().all(|b| b.is_ascii_hexdigit()) {
        Ok(hash)
    } else {
        Err("A SHA-256 hash must be 64 hexadecimal characters.".to_string())
    }
}

fn clean_text(field: &str, value: &str, max: usize, required: bool) -> Result<String, String> {
    let value = value.trim();
    if required && value.is_empty() {
        return Err(format!("{} is required.", field));
    }
    if value.chars().count() > max {
        return Err(format!("{} must be at most {} characters.", field, max));
    }
    Ok(value.to_string())
}

fn owner_prefix(owner: Principal) -> String {
    format!("{}/", owner.to_text())
}

fn find(hash: &str) -> Option<Document> {
    DOCUMENTS.with(|d| d.borrow().get(&hash.to_string()))
}

fn next_version_of(hash: &str) -> Option<String> {
    NEXT_VERSION.with(|n| n.borrow().get(&hash.to_string()))
}

fn owned_hashes(owner: Principal) -> Vec<String> {
    let prefix = owner_prefix(owner);
    BY_OWNER.with(|o| {
        o.borrow()
            .range(prefix.clone()..)
            .take_while(|(key, _)| key.starts_with(&prefix))
            .filter_map(|(key, _)| key.rsplit('/').next().map(str::to_string))
            .collect()
    })
}

fn register_document(owner: Principal, now: u64, args: RegisterArgs) -> Result<Document, RegisterError> {
    use RegisterError::Rejected;

    if owner == Principal::anonymous() {
        return Err(Rejected("Please log in to register documents.".to_string()));
    }

    let hash = normalize_hash(&args.hash).map_err(Rejected)?;
    let title = clean_text("Title", &args.title, MAX_TITLE_LEN, true).map_err(Rejected)?;
    let author = clean_text("Author", &args.author, MAX_AUTHOR_LEN, true).map_err(Rejected)?;
    let file_name = clean_text("File name", &args.file_name, MAX_FILE_NAME_LEN, true).map_err(Rejected)?;
    let description =
        clean_text("Description", &args.description, MAX_DESCRIPTION_LEN, false).map_err(Rejected)?;

    if let Some(existing) = find(&hash) {
        return Err(RegisterError::AlreadyRegistered(existing));
    }
    if owned_hashes(owner).len() >= MAX_DOCUMENTS_PER_OWNER {
        return Err(Rejected(format!(
            "Each account can register at most {} documents.",
            MAX_DOCUMENTS_PER_OWNER
        )));
    }

    let previous = args.previous_hash.as_deref().map(str::trim).filter(|h| !h.is_empty());
    let (previous_hash, version) = match previous {
        None => (None, 1),
        Some(previous) => {
            let previous = normalize_hash(previous).map_err(Rejected)?;
            let earlier = find(&previous)
                .ok_or_else(|| Rejected("The previous version is not registered.".to_string()))?;
            if earlier.owner != owner {
                return Err(Rejected(
                    "Only the account that registered a document can add new versions of it.".to_string(),
                ));
            }
            if next_version_of(&previous).is_some() {
                return Err(Rejected(format!(
                    "Version {} already has a newer version. Add the update to the latest version instead.",
                    earlier.version
                )));
            }
            (Some(previous), earlier.version + 1)
        }
    };

    let document = Document {
        hash: hash.clone(),
        title,
        author,
        description,
        file_name,
        file_size: args.file_size,
        owner,
        registered_at: now,
        previous_hash,
        version,
    };

    DOCUMENTS.with(|d| d.borrow_mut().insert(hash.clone(), document.clone()));
    if let Some(previous) = &document.previous_hash {
        NEXT_VERSION.with(|n| n.borrow_mut().insert(previous.clone(), hash.clone()));
    }
    BY_OWNER.with(|o| {
        o.borrow_mut()
            .insert(format!("{}{:020}/{}", owner_prefix(owner), now, hash), ())
    });

    Ok(document)
}

/// Every version in the chain that contains `hash`, oldest first.
fn history(hash: &str) -> Vec<Document> {
    let Some(mut first) = find(hash) else {
        return Vec::new();
    };
    while let Some(earlier) = first.previous_hash.as_deref().and_then(find) {
        first = earlier;
    }

    let mut versions = vec![first];
    while let Some(later) = next_version_of(&versions[versions.len() - 1].hash).and_then(|h| find(&h)) {
        versions.push(later);
    }
    versions
}

/// Registers a file fingerprint, optionally as a new version of one the caller registered.
#[ic_cdk::update]
fn register(args: RegisterArgs) -> Result<Document, RegisterError> {
    register_document(ic_cdk::api::caller(), ic_cdk::api::time(), args)
}

/// Looks up a single registered file by its SHA-256 hash.
#[ic_cdk::query]
fn get_document(hash: String) -> Option<Document> {
    normalize_hash(&hash).ok().and_then(|h| find(&h))
}

/// Returns all versions of the document that `hash` belongs to, oldest first.
#[ic_cdk::query]
fn get_history(hash: String) -> Vec<Document> {
    normalize_hash(&hash).map(|h| history(&h)).unwrap_or_default()
}

/// Returns the caller's documents, oldest first.
#[ic_cdk::query]
fn get_my_documents() -> Vec<Document> {
    owned_hashes(ic_cdk::api::caller())
        .iter()
        .filter_map(|h| find(h))
        .collect()
}

#[ic_cdk::query]
fn total_documents() -> u64 {
    DOCUMENTS.with(|d| d.borrow().len())
}

ic_cdk::export_candid!();

#[cfg(test)]
mod tests {
    use super::*;

    fn alice() -> Principal {
        Principal::from_slice(&[1])
    }

    fn bob() -> Principal {
        Principal::from_slice(&[2])
    }

    fn hash(n: u8) -> String {
        format!("{:064x}", n)
    }

    fn args(n: u8, previous: Option<u8>) -> RegisterArgs {
        RegisterArgs {
            hash: hash(n),
            title: format!("Paper {}", n),
            author: "Alice".to_string(),
            description: String::new(),
            file_name: format!("paper-{}.pdf", n),
            file_size: 1024,
            previous_hash: previous.map(hash),
        }
    }

    fn rejection(result: Result<Document, RegisterError>) -> String {
        match result {
            Err(RegisterError::Rejected(message)) => message,
            other => panic!("expected a rejection, got {:?}", other),
        }
    }

    #[test]
    fn registers_a_new_document() {
        let doc = register_document(alice(), 100, args(1, None)).unwrap();
        assert_eq!(doc.version, 1);
        assert_eq!(doc.owner, alice());
        assert_eq!(doc.registered_at, 100);
        assert_eq!(find(&hash(1)), Some(doc));
    }

    #[test]
    fn same_file_cannot_be_registered_twice() {
        let original = register_document(alice(), 100, args(1, None)).unwrap();
        let mut again = args(1, None);
        again.title = "Someone else's claim".to_string();
        assert_eq!(
            register_document(bob(), 200, again),
            Err(RegisterError::AlreadyRegistered(original))
        );
    }

    #[test]
    fn rejects_anonymous_callers_and_bad_input() {
        assert!(rejection(register_document(Principal::anonymous(), 1, args(1, None))).contains("log in"));

        let mut bad_hash = args(1, None);
        bad_hash.hash = "not-a-hash".to_string();
        assert!(rejection(register_document(alice(), 1, bad_hash)).contains("64 hexadecimal"));

        let mut no_title = args(1, None);
        no_title.title = "   ".to_string();
        assert!(rejection(register_document(alice(), 1, no_title)).contains("Title"));
    }

    #[test]
    fn hashes_are_case_insensitive() {
        let mut upper = args(0xab, None);
        upper.hash = upper.hash.to_uppercase();
        register_document(alice(), 1, upper).unwrap();
        assert!(get_document(hash(0xab).to_uppercase()).is_some());
    }

    #[test]
    fn history_contains_every_version_from_any_version() {
        register_document(alice(), 1, args(1, None)).unwrap();
        register_document(alice(), 2, args(2, Some(1))).unwrap();
        let latest = register_document(alice(), 3, args(3, Some(2))).unwrap();
        assert_eq!(latest.version, 3);

        for n in 1..=3 {
            let versions: Vec<u32> = history(&hash(n)).iter().map(|d| d.version).collect();
            assert_eq!(versions, vec![1, 2, 3]);
        }
        assert!(history(&hash(9)).is_empty());
    }

    #[test]
    fn only_the_owner_can_add_versions() {
        register_document(alice(), 1, args(1, None)).unwrap();
        assert!(rejection(register_document(bob(), 2, args(2, Some(1)))).contains("Only the account"));
        assert!(rejection(register_document(alice(), 2, args(2, Some(7)))).contains("not registered"));
    }

    #[test]
    fn new_versions_must_extend_the_latest_version() {
        register_document(alice(), 1, args(1, None)).unwrap();
        register_document(alice(), 2, args(2, Some(1))).unwrap();
        assert!(rejection(register_document(alice(), 3, args(3, Some(1)))).contains("newer version"));
    }

    #[test]
    fn lists_documents_per_owner() {
        register_document(alice(), 1, args(1, None)).unwrap();
        register_document(bob(), 2, args(2, None)).unwrap();
        register_document(alice(), 3, args(3, Some(1))).unwrap();
        assert_eq!(owned_hashes(alice()), vec![hash(1), hash(3)]);
        assert_eq!(owned_hashes(bob()), vec![hash(2)]);
    }

    #[test]
    fn candid_interface_is_up_to_date() {
        let expected = __export_service();
        let actual = std::fs::read_to_string("metasupply_backend.did").unwrap_or_default();
        assert_eq!(
            actual.trim().replace("\r\n", "\n"),
            expected.trim(),
            "metasupply_backend.did is out of date; replace it with the interface above"
        );
    }
}
