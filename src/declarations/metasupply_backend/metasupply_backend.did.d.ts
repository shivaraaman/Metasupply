import type { Principal } from '@icp-sdk/core/principal';
import type { ActorMethod } from '@icp-sdk/core/agent';
import type { IDL } from '@icp-sdk/core/candid';

export interface AiDetails {
  'model' : string,
  'dataset' : string,
  'tool' : string,
  'prompt' : string,
  'dataset_license' : DatasetLicense,
}
export type ContentType = { 'Code' : null } |
  { 'Text' : null } |
  { 'Image' : null } |
  { 'Document' : null } |
  { 'Audio' : null } |
  { 'Other' : null } |
  { 'Video' : null } |
  { 'Dataset' : null };
export type DatasetLicense = { 'Licensed' : null } |
  { 'Open' : null } |
  { 'Private' : null } |
  { 'Unknown' : null } |
  { 'Scraped' : null };
export interface Document {
  'ai' : [] | [AiDetails],
  'title' : string,
  'owner' : Principal,
  'hash' : string,
  'content_type' : ContentType,
  'description' : string,
  'file_name' : string,
  'file_size' : bigint,
  'author' : string,
  'version' : number,
  'previous_hash' : [] | [string],
  'registered_at' : bigint,
}
export interface RegisterArgs {
  'ai' : [] | [AiDetails],
  'title' : string,
  'hash' : string,
  'content_type' : ContentType,
  'description' : string,
  'file_name' : string,
  'file_size' : bigint,
  'author' : string,
  'previous_hash' : [] | [string],
}
export type RegisterError = { 'AlreadyRegistered' : Document } |
  { 'Rejected' : string };
export type Result = { 'Ok' : Document } |
  { 'Err' : RegisterError };
export interface _SERVICE {
  'get_document' : ActorMethod<[string], [] | [Document]>,
  'get_history' : ActorMethod<[string], Array<Document>>,
  'get_my_documents' : ActorMethod<[], Array<Document>>,
  'register' : ActorMethod<[RegisterArgs], Result>,
  'total_documents' : ActorMethod<[], bigint>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
