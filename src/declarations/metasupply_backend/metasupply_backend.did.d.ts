import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface FileMetadata {
  'id' : string,
  'model' : string,
  'creator' : Principal,
  'dataset' : string,
  'filename' : string,
  'previous_hash' : [] | [string],
  'timestamp' : bigint,
  'prompt' : string,
}
export type Result = { 'Ok' : string } |
  { 'Err' : string };
export interface _SERVICE {
  'get_all_files' : ActorMethod<[], Array<FileMetadata>>,
  'upload_file' : ActorMethod<
    [string, string, string, string, string, [] | [string]],
    Result
  >,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
