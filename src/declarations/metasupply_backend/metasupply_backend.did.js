export const idlFactory = ({ IDL }) => {
  const FileMetadata = IDL.Record({
    'id' : IDL.Text,
    'model' : IDL.Text,
    'creator' : IDL.Principal,
    'dataset' : IDL.Text,
    'filename' : IDL.Text,
    'previous_hash' : IDL.Opt(IDL.Text),
    'timestamp' : IDL.Nat64,
    'prompt' : IDL.Text,
  });
  const Result = IDL.Variant({ 'Ok' : IDL.Text, 'Err' : IDL.Text });
  return IDL.Service({
    'get_all_files' : IDL.Func([], [IDL.Vec(FileMetadata)], ['query']),
    'upload_file' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Opt(IDL.Text)],
        [Result],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
