import 'graphql-import-node'; // Needed so you can import *.graphql files 

import { makeBindingClass, Options } from 'graphql-binding'
import { GraphQLResolveInfo, GraphQLSchema } from 'graphql'
import { IResolvers } from 'graphql-tools/dist/Interfaces'
import * as schema from  './schema.graphql'

export interface Query {
    accounts: <T = Array<Account>>(args: { offset?: Int | null, limit?: Int | null, where?: AccountWhereInput | null, orderBy?: Array<AccountOrderByInput> | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    accountByUniqueInput: <T = Account | null>(args: { where: AccountWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    accountsConnection: <T = AccountConnection>(args: { first?: Int | null, after?: String | null, last?: Int | null, before?: String | null, where?: AccountWhereInput | null, orderBy?: Array<AccountOrderByInput> | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    collections: <T = Array<Collection>>(args: { offset?: Int | null, limit?: Int | null, where?: CollectionWhereInput | null, orderBy?: Array<CollectionOrderByInput> | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    collectionByUniqueInput: <T = Collection | null>(args: { where: CollectionWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    collectionsConnection: <T = CollectionConnection>(args: { first?: Int | null, after?: String | null, last?: Int | null, before?: String | null, where?: CollectionWhereInput | null, orderBy?: Array<CollectionOrderByInput> | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    historicalBalances: <T = Array<HistoricalBalance>>(args: { offset?: Int | null, limit?: Int | null, where?: HistoricalBalanceWhereInput | null, orderBy?: Array<HistoricalBalanceOrderByInput> | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    historicalBalanceByUniqueInput: <T = HistoricalBalance | null>(args: { where: HistoricalBalanceWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    historicalBalancesConnection: <T = HistoricalBalanceConnection>(args: { first?: Int | null, after?: String | null, last?: Int | null, before?: String | null, where?: HistoricalBalanceWhereInput | null, orderBy?: Array<HistoricalBalanceOrderByInput> | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    nfts: <T = Array<Nft>>(args: { offset?: Int | null, limit?: Int | null, where?: NftWhereInput | null, orderBy?: Array<NftOrderByInput> | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    nftByUniqueInput: <T = Nft | null>(args: { where: NftWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    nftsConnection: <T = NftConnection>(args: { first?: Int | null, after?: String | null, last?: Int | null, before?: String | null, where?: NftWhereInput | null, orderBy?: Array<NftOrderByInput> | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    hello: <T = Hello>(args?: {}, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> 
  }

export interface Mutation {}

export interface Subscription {
    stateSubscription: <T = ProcessorState>(args?: {}, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T>> 
  }

export interface Binding {
  query: Query
  mutation: Mutation
  subscription: Subscription
  request: <T = any>(query: string, variables?: {[key: string]: any}) => Promise<T>
  delegate(operation: 'query' | 'mutation', fieldName: string, args: {
      [key: string]: any;
  }, infoOrQuery?: GraphQLResolveInfo | string, options?: Options): Promise<any>;
  delegateSubscription(fieldName: string, args?: {
      [key: string]: any;
  }, infoOrQuery?: GraphQLResolveInfo | string, options?: Options): Promise<AsyncIterator<any>>;
  getAbstractResolvers(filterSchema?: GraphQLSchema | string): IResolvers;
}

export interface BindingConstructor<T> {
  new(...args: any[]): T
}

export const Binding = makeBindingClass<BindingConstructor<Binding>>({ schema: schema as any })

/**
 * Types
*/

export type AccountOrderByInput =   'createdAt_ASC' |
  'createdAt_DESC' |
  'updatedAt_ASC' |
  'updatedAt_DESC' |
  'deletedAt_ASC' |
  'deletedAt_DESC' |
  'wallet_ASC' |
  'wallet_DESC' |
  'balance_ASC' |
  'balance_DESC'

export type CollectionOrderByInput =   'createdAt_ASC' |
  'createdAt_DESC' |
  'updatedAt_ASC' |
  'updatedAt_DESC' |
  'deletedAt_ASC' |
  'deletedAt_DESC' |
  'idIndexing_ASC' |
  'idIndexing_DESC' |
  'name_ASC' |
  'name_DESC' |
  'max_ASC' |
  'max_DESC' |
  'issuer_ASC' |
  'issuer_DESC' |
  'symbol_ASC' |
  'symbol_DESC' |
  'rmrkVersion_ASC' |
  'rmrkVersion_DESC' |
  'metadata_ASC' |
  'metadata_DESC' |
  'block_ASC' |
  'block_DESC'

export type HistoricalBalanceOrderByInput =   'createdAt_ASC' |
  'createdAt_DESC' |
  'updatedAt_ASC' |
  'updatedAt_DESC' |
  'deletedAt_ASC' |
  'deletedAt_DESC' |
  'account_ASC' |
  'account_DESC' |
  'balance_ASC' |
  'balance_DESC' |
  'timestamp_ASC' |
  'timestamp_DESC'

export type NftOrderByInput =   'createdAt_ASC' |
  'createdAt_DESC' |
  'updatedAt_ASC' |
  'updatedAt_DESC' |
  'deletedAt_ASC' |
  'deletedAt_DESC' |
  'idIndexing_ASC' |
  'idIndexing_DESC' |
  'collection_ASC' |
  'collection_DESC' |
  'symbol_ASC' |
  'symbol_DESC' |
  'transferable_ASC' |
  'transferable_DESC' |
  'rmrkVersion_ASC' |
  'rmrkVersion_DESC' |
  'sn_ASC' |
  'sn_DESC' |
  'metadata_ASC' |
  'metadata_DESC' |
  'block_ASC' |
  'block_DESC'

export interface AccountCreateInput {
  wallet: String
  balance: String
}

export interface AccountUpdateInput {
  wallet?: String | null
  balance?: String | null
}

export interface AccountWhereInput {
  id_eq?: ID_Input | null
  id_in?: ID_Output[] | ID_Output | null
  createdAt_eq?: DateTime | null
  createdAt_lt?: DateTime | null
  createdAt_lte?: DateTime | null
  createdAt_gt?: DateTime | null
  createdAt_gte?: DateTime | null
  createdById_eq?: ID_Input | null
  createdById_in?: ID_Output[] | ID_Output | null
  updatedAt_eq?: DateTime | null
  updatedAt_lt?: DateTime | null
  updatedAt_lte?: DateTime | null
  updatedAt_gt?: DateTime | null
  updatedAt_gte?: DateTime | null
  updatedById_eq?: ID_Input | null
  updatedById_in?: ID_Output[] | ID_Output | null
  deletedAt_all?: Boolean | null
  deletedAt_eq?: DateTime | null
  deletedAt_lt?: DateTime | null
  deletedAt_lte?: DateTime | null
  deletedAt_gt?: DateTime | null
  deletedAt_gte?: DateTime | null
  deletedById_eq?: ID_Input | null
  deletedById_in?: ID_Output[] | ID_Output | null
  wallet_eq?: String | null
  wallet_contains?: String | null
  wallet_startsWith?: String | null
  wallet_endsWith?: String | null
  wallet_in?: String[] | String | null
  balance_eq?: BigInt | null
  balance_gt?: BigInt | null
  balance_gte?: BigInt | null
  balance_lt?: BigInt | null
  balance_lte?: BigInt | null
  balance_in?: BigInt[] | BigInt | null
  historicalBalances_none?: HistoricalBalanceWhereInput | null
  historicalBalances_some?: HistoricalBalanceWhereInput | null
  historicalBalances_every?: HistoricalBalanceWhereInput | null
  AND?: AccountWhereInput[] | AccountWhereInput | null
  OR?: AccountWhereInput[] | AccountWhereInput | null
}

export interface AccountWhereUniqueInput {
  id: ID_Output
}

export interface BaseWhereInput {
  id_eq?: String | null
  id_in?: String[] | String | null
  createdAt_eq?: String | null
  createdAt_lt?: String | null
  createdAt_lte?: String | null
  createdAt_gt?: String | null
  createdAt_gte?: String | null
  createdById_eq?: String | null
  updatedAt_eq?: String | null
  updatedAt_lt?: String | null
  updatedAt_lte?: String | null
  updatedAt_gt?: String | null
  updatedAt_gte?: String | null
  updatedById_eq?: String | null
  deletedAt_all?: Boolean | null
  deletedAt_eq?: String | null
  deletedAt_lt?: String | null
  deletedAt_lte?: String | null
  deletedAt_gt?: String | null
  deletedAt_gte?: String | null
  deletedById_eq?: String | null
}

export interface CollectionCreateInput {
  idIndexing: String
  name?: String | null
  max: String
  issuer?: String | null
  symbol: String
  rmrkVersion?: String | null
  metadata?: String | null
  block: String
}

export interface CollectionUpdateInput {
  idIndexing?: String | null
  name?: String | null
  max?: String | null
  issuer?: String | null
  symbol?: String | null
  rmrkVersion?: String | null
  metadata?: String | null
  block?: String | null
}

export interface CollectionWhereInput {
  id_eq?: ID_Input | null
  id_in?: ID_Output[] | ID_Output | null
  createdAt_eq?: DateTime | null
  createdAt_lt?: DateTime | null
  createdAt_lte?: DateTime | null
  createdAt_gt?: DateTime | null
  createdAt_gte?: DateTime | null
  createdById_eq?: ID_Input | null
  createdById_in?: ID_Output[] | ID_Output | null
  updatedAt_eq?: DateTime | null
  updatedAt_lt?: DateTime | null
  updatedAt_lte?: DateTime | null
  updatedAt_gt?: DateTime | null
  updatedAt_gte?: DateTime | null
  updatedById_eq?: ID_Input | null
  updatedById_in?: ID_Output[] | ID_Output | null
  deletedAt_all?: Boolean | null
  deletedAt_eq?: DateTime | null
  deletedAt_lt?: DateTime | null
  deletedAt_lte?: DateTime | null
  deletedAt_gt?: DateTime | null
  deletedAt_gte?: DateTime | null
  deletedById_eq?: ID_Input | null
  deletedById_in?: ID_Output[] | ID_Output | null
  idIndexing_eq?: BigInt | null
  idIndexing_gt?: BigInt | null
  idIndexing_gte?: BigInt | null
  idIndexing_lt?: BigInt | null
  idIndexing_lte?: BigInt | null
  idIndexing_in?: BigInt[] | BigInt | null
  name_eq?: String | null
  name_contains?: String | null
  name_startsWith?: String | null
  name_endsWith?: String | null
  name_in?: String[] | String | null
  max_eq?: BigInt | null
  max_gt?: BigInt | null
  max_gte?: BigInt | null
  max_lt?: BigInt | null
  max_lte?: BigInt | null
  max_in?: BigInt[] | BigInt | null
  issuer_eq?: String | null
  issuer_contains?: String | null
  issuer_startsWith?: String | null
  issuer_endsWith?: String | null
  issuer_in?: String[] | String | null
  symbol_eq?: String | null
  symbol_contains?: String | null
  symbol_startsWith?: String | null
  symbol_endsWith?: String | null
  symbol_in?: String[] | String | null
  rmrkVersion_eq?: String | null
  rmrkVersion_contains?: String | null
  rmrkVersion_startsWith?: String | null
  rmrkVersion_endsWith?: String | null
  rmrkVersion_in?: String[] | String | null
  metadata_eq?: String | null
  metadata_contains?: String | null
  metadata_startsWith?: String | null
  metadata_endsWith?: String | null
  metadata_in?: String[] | String | null
  block_eq?: BigInt | null
  block_gt?: BigInt | null
  block_gte?: BigInt | null
  block_lt?: BigInt | null
  block_lte?: BigInt | null
  block_in?: BigInt[] | BigInt | null
  AND?: CollectionWhereInput[] | CollectionWhereInput | null
  OR?: CollectionWhereInput[] | CollectionWhereInput | null
}

export interface CollectionWhereUniqueInput {
  id?: ID_Input | null
  idIndexing?: BigInt | null
}

export interface HistoricalBalanceCreateInput {
  account: ID_Output
  balance: String
  timestamp: String
}

export interface HistoricalBalanceUpdateInput {
  account?: ID_Input | null
  balance?: String | null
  timestamp?: String | null
}

export interface HistoricalBalanceWhereInput {
  id_eq?: ID_Input | null
  id_in?: ID_Output[] | ID_Output | null
  createdAt_eq?: DateTime | null
  createdAt_lt?: DateTime | null
  createdAt_lte?: DateTime | null
  createdAt_gt?: DateTime | null
  createdAt_gte?: DateTime | null
  createdById_eq?: ID_Input | null
  createdById_in?: ID_Output[] | ID_Output | null
  updatedAt_eq?: DateTime | null
  updatedAt_lt?: DateTime | null
  updatedAt_lte?: DateTime | null
  updatedAt_gt?: DateTime | null
  updatedAt_gte?: DateTime | null
  updatedById_eq?: ID_Input | null
  updatedById_in?: ID_Output[] | ID_Output | null
  deletedAt_all?: Boolean | null
  deletedAt_eq?: DateTime | null
  deletedAt_lt?: DateTime | null
  deletedAt_lte?: DateTime | null
  deletedAt_gt?: DateTime | null
  deletedAt_gte?: DateTime | null
  deletedById_eq?: ID_Input | null
  deletedById_in?: ID_Output[] | ID_Output | null
  balance_eq?: BigInt | null
  balance_gt?: BigInt | null
  balance_gte?: BigInt | null
  balance_lt?: BigInt | null
  balance_lte?: BigInt | null
  balance_in?: BigInt[] | BigInt | null
  timestamp_eq?: BigInt | null
  timestamp_gt?: BigInt | null
  timestamp_gte?: BigInt | null
  timestamp_lt?: BigInt | null
  timestamp_lte?: BigInt | null
  timestamp_in?: BigInt[] | BigInt | null
  account?: AccountWhereInput | null
  AND?: HistoricalBalanceWhereInput[] | HistoricalBalanceWhereInput | null
  OR?: HistoricalBalanceWhereInput[] | HistoricalBalanceWhereInput | null
}

export interface HistoricalBalanceWhereUniqueInput {
  id: ID_Output
}

export interface NftCreateInput {
  idIndexing: String
  collection: String
  symbol?: String | null
  transferable: String
  rmrkVersion?: String | null
  sn?: String | null
  metadata?: String | null
  block: String
}

export interface NftUpdateInput {
  idIndexing?: String | null
  collection?: String | null
  symbol?: String | null
  transferable?: String | null
  rmrkVersion?: String | null
  sn?: String | null
  metadata?: String | null
  block?: String | null
}

export interface NftWhereInput {
  id_eq?: ID_Input | null
  id_in?: ID_Output[] | ID_Output | null
  createdAt_eq?: DateTime | null
  createdAt_lt?: DateTime | null
  createdAt_lte?: DateTime | null
  createdAt_gt?: DateTime | null
  createdAt_gte?: DateTime | null
  createdById_eq?: ID_Input | null
  createdById_in?: ID_Output[] | ID_Output | null
  updatedAt_eq?: DateTime | null
  updatedAt_lt?: DateTime | null
  updatedAt_lte?: DateTime | null
  updatedAt_gt?: DateTime | null
  updatedAt_gte?: DateTime | null
  updatedById_eq?: ID_Input | null
  updatedById_in?: ID_Output[] | ID_Output | null
  deletedAt_all?: Boolean | null
  deletedAt_eq?: DateTime | null
  deletedAt_lt?: DateTime | null
  deletedAt_lte?: DateTime | null
  deletedAt_gt?: DateTime | null
  deletedAt_gte?: DateTime | null
  deletedById_eq?: ID_Input | null
  deletedById_in?: ID_Output[] | ID_Output | null
  idIndexing_eq?: BigInt | null
  idIndexing_gt?: BigInt | null
  idIndexing_gte?: BigInt | null
  idIndexing_lt?: BigInt | null
  idIndexing_lte?: BigInt | null
  idIndexing_in?: BigInt[] | BigInt | null
  collection_eq?: String | null
  collection_contains?: String | null
  collection_startsWith?: String | null
  collection_endsWith?: String | null
  collection_in?: String[] | String | null
  symbol_eq?: String | null
  symbol_contains?: String | null
  symbol_startsWith?: String | null
  symbol_endsWith?: String | null
  symbol_in?: String[] | String | null
  transferable_eq?: BigInt | null
  transferable_gt?: BigInt | null
  transferable_gte?: BigInt | null
  transferable_lt?: BigInt | null
  transferable_lte?: BigInt | null
  transferable_in?: BigInt[] | BigInt | null
  rmrkVersion_eq?: String | null
  rmrkVersion_contains?: String | null
  rmrkVersion_startsWith?: String | null
  rmrkVersion_endsWith?: String | null
  rmrkVersion_in?: String[] | String | null
  sn_eq?: String | null
  sn_contains?: String | null
  sn_startsWith?: String | null
  sn_endsWith?: String | null
  sn_in?: String[] | String | null
  metadata_eq?: String | null
  metadata_contains?: String | null
  metadata_startsWith?: String | null
  metadata_endsWith?: String | null
  metadata_in?: String[] | String | null
  block_eq?: BigInt | null
  block_gt?: BigInt | null
  block_gte?: BigInt | null
  block_lt?: BigInt | null
  block_lte?: BigInt | null
  block_in?: BigInt[] | BigInt | null
  AND?: NftWhereInput[] | NftWhereInput | null
  OR?: NftWhereInput[] | NftWhereInput | null
}

export interface NftWhereUniqueInput {
  id?: ID_Input | null
  idIndexing?: BigInt | null
}

export interface BaseGraphQLObject {
  id: ID_Output
  createdAt: DateTime
  createdById: String
  updatedAt?: DateTime | null
  updatedById?: String | null
  deletedAt?: DateTime | null
  deletedById?: String | null
  version: Int
}

export interface DeleteResponse {
  id: ID_Output
}

export interface Account extends BaseGraphQLObject {
  id: ID_Output
  createdAt: DateTime
  createdById: String
  updatedAt?: DateTime | null
  updatedById?: String | null
  deletedAt?: DateTime | null
  deletedById?: String | null
  version: Int
  wallet: String
  balance: BigInt
  historicalBalances: Array<HistoricalBalance>
}

export interface AccountConnection {
  totalCount: Int
  edges: Array<AccountEdge>
  pageInfo: PageInfo
}

export interface AccountEdge {
  node: Account
  cursor: String
}

export interface BaseModel extends BaseGraphQLObject {
  id: ID_Output
  createdAt: DateTime
  createdById: String
  updatedAt?: DateTime | null
  updatedById?: String | null
  deletedAt?: DateTime | null
  deletedById?: String | null
  version: Int
}

export interface BaseModelUUID extends BaseGraphQLObject {
  id: ID_Output
  createdAt: DateTime
  createdById: String
  updatedAt?: DateTime | null
  updatedById?: String | null
  deletedAt?: DateTime | null
  deletedById?: String | null
  version: Int
}

export interface Collection extends BaseGraphQLObject {
  id: ID_Output
  createdAt: DateTime
  createdById: String
  updatedAt?: DateTime | null
  updatedById?: String | null
  deletedAt?: DateTime | null
  deletedById?: String | null
  version: Int
  idIndexing: BigInt
  name?: String | null
  max: BigInt
  issuer?: String | null
  symbol: String
  rmrkVersion?: String | null
  metadata?: String | null
  block: BigInt
}

export interface CollectionConnection {
  totalCount: Int
  edges: Array<CollectionEdge>
  pageInfo: PageInfo
}

export interface CollectionEdge {
  node: Collection
  cursor: String
}

export interface Hello {
  greeting: String
}

export interface HistoricalBalance extends BaseGraphQLObject {
  id: ID_Output
  createdAt: DateTime
  createdById: String
  updatedAt?: DateTime | null
  updatedById?: String | null
  deletedAt?: DateTime | null
  deletedById?: String | null
  version: Int
  account: Account
  accountId: String
  balance: BigInt
  timestamp: BigInt
}

export interface HistoricalBalanceConnection {
  totalCount: Int
  edges: Array<HistoricalBalanceEdge>
  pageInfo: PageInfo
}

export interface HistoricalBalanceEdge {
  node: HistoricalBalance
  cursor: String
}

export interface Nft extends BaseGraphQLObject {
  id: ID_Output
  createdAt: DateTime
  createdById: String
  updatedAt?: DateTime | null
  updatedById?: String | null
  deletedAt?: DateTime | null
  deletedById?: String | null
  version: Int
  idIndexing: BigInt
  collection: String
  symbol?: String | null
  transferable: BigInt
  rmrkVersion?: String | null
  sn?: String | null
  metadata?: String | null
  block: BigInt
}

export interface NftConnection {
  totalCount: Int
  edges: Array<NftEdge>
  pageInfo: PageInfo
}

export interface NftEdge {
  node: Nft
  cursor: String
}

export interface PageInfo {
  hasNextPage: Boolean
  hasPreviousPage: Boolean
  startCursor?: String | null
  endCursor?: String | null
}

export interface ProcessorState {
  lastCompleteBlock: Float
  lastProcessedEvent: String
  indexerHead: Float
  chainHead: Float
}

export interface StandardDeleteResponse {
  id: ID_Output
}

/*
GraphQL representation of BigInt
*/
export type BigInt = string

/*
The `Boolean` scalar type represents `true` or `false`.
*/
export type Boolean = boolean

/*
The javascript `Date` as string. Type represents date and time as the ISO Date string.
*/
export type DateTime = Date | string

/*
The `Float` scalar type represents signed double-precision fractional values as specified by [IEEE 754](https://en.wikipedia.org/wiki/IEEE_floating_point).
*/
export type Float = number

/*
The `ID` scalar type represents a unique identifier, often used to refetch an object or as key for a cache. The ID type appears in a JSON response as a String; however, it is not intended to be human-readable. When expected as an input type, any string (such as `"4"`) or integer (such as `4`) input value will be accepted as an ID.
*/
export type ID_Input = string | number
export type ID_Output = string

/*
The `Int` scalar type represents non-fractional signed whole numeric values. Int can represent values between -(2^31) and 2^31 - 1.
*/
export type Int = number

/*
The `String` scalar type represents textual data, represented as UTF-8 character sequences. The String type is most often used by GraphQL to represent free-form human-readable text.
*/
export type String = string