export const idlFactory = ({ IDL }) => {
  const Document = IDL.Record({
    'title' : IDL.Text,
    'owner' : IDL.Principal,
    'hash' : IDL.Text,
    'description' : IDL.Text,
    'file_name' : IDL.Text,
    'file_size' : IDL.Nat64,
    'author' : IDL.Text,
    'version' : IDL.Nat32,
    'previous_hash' : IDL.Opt(IDL.Text),
    'registered_at' : IDL.Nat64,
  });
  const RegisterArgs = IDL.Record({
    'title' : IDL.Text,
    'hash' : IDL.Text,
    'description' : IDL.Text,
    'file_name' : IDL.Text,
    'file_size' : IDL.Nat64,
    'author' : IDL.Text,
    'previous_hash' : IDL.Opt(IDL.Text),
  });
  const RegisterError = IDL.Variant({
    'AlreadyRegistered' : Document,
    'Rejected' : IDL.Text,
  });
  const Result = IDL.Variant({ 'Ok' : Document, 'Err' : RegisterError });
  return IDL.Service({
    'get_document' : IDL.Func([IDL.Text], [IDL.Opt(Document)], ['query']),
    'get_history' : IDL.Func([IDL.Text], [IDL.Vec(Document)], ['query']),
    'get_my_documents' : IDL.Func([], [IDL.Vec(Document)], ['query']),
    'register' : IDL.Func([RegisterArgs], [Result], []),
    'total_documents' : IDL.Func([], [IDL.Nat64], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
