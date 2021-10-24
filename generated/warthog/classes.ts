// This file has been auto-generated by Warthog.  Do not update directly as it
// will be re-written.  If you need to change this file, update models or add
// new TypeGraphQL objects
// prettier-ignore
// @ts-ignore
import { DateResolver as Date } from 'graphql-scalars';
// prettier-ignore
// @ts-ignore
import { GraphQLID as ID } from 'graphql';
// prettier-ignore
// @ts-ignore
import { ArgsType, Field as TypeGraphQLField, Float, InputType as TypeGraphQLInputType, Int } from 'type-graphql';
// prettier-ignore
// @ts-ignore
import { registerEnumType, GraphQLISODateTime as DateTime } from "type-graphql";

import * as BN from "bn.js";

// prettier-ignore
// @ts-ignore eslint-disable-next-line @typescript-eslint/no-var-requires
const { GraphQLJSONObject } = require('graphql-type-json');
// prettier-ignore
// @ts-ignore
import { BaseWhereInput, JsonObject, PaginationArgs, DateOnlyString, DateTimeString, BigInt, Bytes } from '@subsquid/warthog';

// @ts-ignore
import { HistoricalBalance } from "../modules/historical-balance/historical-balance.model";
// @ts-ignore
import { Account } from "../modules/account/account.model";
// @ts-ignore
import { Collection } from "../modules/collection/collection.model";
// @ts-ignore
import { Call } from "../modules/jsonfields/jsonfields.model";
// @ts-ignore
import { Nft } from "../modules/nft/nft.model";
// @ts-ignore
import { Rmrk } from "../modules/rmrk/rmrk.model";

export enum HistoricalBalanceOrderByEnum {
  createdAt_ASC = "createdAt_ASC",
  createdAt_DESC = "createdAt_DESC",

  updatedAt_ASC = "updatedAt_ASC",
  updatedAt_DESC = "updatedAt_DESC",

  deletedAt_ASC = "deletedAt_ASC",
  deletedAt_DESC = "deletedAt_DESC",

  account_ASC = "account_ASC",
  account_DESC = "account_DESC",

  balance_ASC = "balance_ASC",
  balance_DESC = "balance_DESC",

  timestamp_ASC = "timestamp_ASC",
  timestamp_DESC = "timestamp_DESC",
}

registerEnumType(HistoricalBalanceOrderByEnum, {
  name: "HistoricalBalanceOrderByInput",
});

@TypeGraphQLInputType()
export class HistoricalBalanceWhereInput {
  @TypeGraphQLField(() => ID, { nullable: true })
  id_eq?: string;

  @TypeGraphQLField(() => [ID], { nullable: true })
  id_in?: string[];

  @TypeGraphQLField(() => DateTime, { nullable: true })
  createdAt_eq?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  createdAt_lt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  createdAt_lte?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  createdAt_gt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  createdAt_gte?: Date;

  @TypeGraphQLField(() => ID, { nullable: true })
  createdById_eq?: string;

  @TypeGraphQLField(() => [ID], { nullable: true })
  createdById_in?: string[];

  @TypeGraphQLField(() => DateTime, { nullable: true })
  updatedAt_eq?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  updatedAt_lt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  updatedAt_lte?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  updatedAt_gt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  updatedAt_gte?: Date;

  @TypeGraphQLField(() => ID, { nullable: true })
  updatedById_eq?: string;

  @TypeGraphQLField(() => [ID], { nullable: true })
  updatedById_in?: string[];

  @TypeGraphQLField({ nullable: true })
  deletedAt_all?: Boolean;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  deletedAt_eq?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  deletedAt_lt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  deletedAt_lte?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  deletedAt_gt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  deletedAt_gte?: Date;

  @TypeGraphQLField(() => ID, { nullable: true })
  deletedById_eq?: string;

  @TypeGraphQLField(() => [ID], { nullable: true })
  deletedById_in?: string[];

  @TypeGraphQLField(() => BigInt, { nullable: true })
  balance_eq?: string;

  @TypeGraphQLField(() => BigInt, { nullable: true })
  balance_gt?: string;

  @TypeGraphQLField(() => BigInt, { nullable: true })
  balance_gte?: string;

  @TypeGraphQLField(() => BigInt, { nullable: true })
  balance_lt?: string;

  @TypeGraphQLField(() => BigInt, { nullable: true })
  balance_lte?: string;

  @TypeGraphQLField(() => [BigInt], { nullable: true })
  balance_in?: string[];

  @TypeGraphQLField(() => BigInt, { nullable: true })
  timestamp_eq?: string;

  @TypeGraphQLField(() => BigInt, { nullable: true })
  timestamp_gt?: string;

  @TypeGraphQLField(() => BigInt, { nullable: true })
  timestamp_gte?: string;

  @TypeGraphQLField(() => BigInt, { nullable: true })
  timestamp_lt?: string;

  @TypeGraphQLField(() => BigInt, { nullable: true })
  timestamp_lte?: string;

  @TypeGraphQLField(() => [BigInt], { nullable: true })
  timestamp_in?: string[];

  @TypeGraphQLField(() => AccountWhereInput, { nullable: true })
  account?: AccountWhereInput;

  @TypeGraphQLField(() => HistoricalBalanceWhereInput, { nullable: true })
  AND?: [HistoricalBalanceWhereInput];

  @TypeGraphQLField(() => HistoricalBalanceWhereInput, { nullable: true })
  OR?: [HistoricalBalanceWhereInput];
}

@TypeGraphQLInputType()
export class HistoricalBalanceWhereUniqueInput {
  @TypeGraphQLField(() => ID)
  id?: string;
}

@TypeGraphQLInputType()
export class HistoricalBalanceCreateInput {
  @TypeGraphQLField(() => ID)
  account!: string;

  @TypeGraphQLField()
  balance!: string;

  @TypeGraphQLField()
  timestamp!: string;
}

@TypeGraphQLInputType()
export class HistoricalBalanceUpdateInput {
  @TypeGraphQLField(() => ID, { nullable: true })
  account?: string;

  @TypeGraphQLField({ nullable: true })
  balance?: string;

  @TypeGraphQLField({ nullable: true })
  timestamp?: string;
}

@ArgsType()
export class HistoricalBalanceWhereArgs extends PaginationArgs {
  @TypeGraphQLField(() => HistoricalBalanceWhereInput, { nullable: true })
  where?: HistoricalBalanceWhereInput;

  @TypeGraphQLField(() => HistoricalBalanceOrderByEnum, { nullable: true })
  orderBy?: HistoricalBalanceOrderByEnum[];
}

@ArgsType()
export class HistoricalBalanceCreateManyArgs {
  @TypeGraphQLField(() => [HistoricalBalanceCreateInput])
  data!: HistoricalBalanceCreateInput[];
}

@ArgsType()
export class HistoricalBalanceUpdateArgs {
  @TypeGraphQLField() data!: HistoricalBalanceUpdateInput;
  @TypeGraphQLField() where!: HistoricalBalanceWhereUniqueInput;
}

export enum AccountOrderByEnum {
  createdAt_ASC = "createdAt_ASC",
  createdAt_DESC = "createdAt_DESC",

  updatedAt_ASC = "updatedAt_ASC",
  updatedAt_DESC = "updatedAt_DESC",

  deletedAt_ASC = "deletedAt_ASC",
  deletedAt_DESC = "deletedAt_DESC",

  wallet_ASC = "wallet_ASC",
  wallet_DESC = "wallet_DESC",

  balance_ASC = "balance_ASC",
  balance_DESC = "balance_DESC",
}

registerEnumType(AccountOrderByEnum, {
  name: "AccountOrderByInput",
});

@TypeGraphQLInputType()
export class AccountWhereInput {
  @TypeGraphQLField(() => ID, { nullable: true })
  id_eq?: string;

  @TypeGraphQLField(() => [ID], { nullable: true })
  id_in?: string[];

  @TypeGraphQLField(() => DateTime, { nullable: true })
  createdAt_eq?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  createdAt_lt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  createdAt_lte?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  createdAt_gt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  createdAt_gte?: Date;

  @TypeGraphQLField(() => ID, { nullable: true })
  createdById_eq?: string;

  @TypeGraphQLField(() => [ID], { nullable: true })
  createdById_in?: string[];

  @TypeGraphQLField(() => DateTime, { nullable: true })
  updatedAt_eq?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  updatedAt_lt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  updatedAt_lte?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  updatedAt_gt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  updatedAt_gte?: Date;

  @TypeGraphQLField(() => ID, { nullable: true })
  updatedById_eq?: string;

  @TypeGraphQLField(() => [ID], { nullable: true })
  updatedById_in?: string[];

  @TypeGraphQLField({ nullable: true })
  deletedAt_all?: Boolean;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  deletedAt_eq?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  deletedAt_lt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  deletedAt_lte?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  deletedAt_gt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  deletedAt_gte?: Date;

  @TypeGraphQLField(() => ID, { nullable: true })
  deletedById_eq?: string;

  @TypeGraphQLField(() => [ID], { nullable: true })
  deletedById_in?: string[];

  @TypeGraphQLField({ nullable: true })
  wallet_eq?: string;

  @TypeGraphQLField({ nullable: true })
  wallet_contains?: string;

  @TypeGraphQLField({ nullable: true })
  wallet_startsWith?: string;

  @TypeGraphQLField({ nullable: true })
  wallet_endsWith?: string;

  @TypeGraphQLField(() => [String], { nullable: true })
  wallet_in?: string[];

  @TypeGraphQLField(() => BigInt, { nullable: true })
  balance_eq?: string;

  @TypeGraphQLField(() => BigInt, { nullable: true })
  balance_gt?: string;

  @TypeGraphQLField(() => BigInt, { nullable: true })
  balance_gte?: string;

  @TypeGraphQLField(() => BigInt, { nullable: true })
  balance_lt?: string;

  @TypeGraphQLField(() => BigInt, { nullable: true })
  balance_lte?: string;

  @TypeGraphQLField(() => [BigInt], { nullable: true })
  balance_in?: string[];

  @TypeGraphQLField(() => HistoricalBalanceWhereInput, { nullable: true })
  historicalBalances_none?: HistoricalBalanceWhereInput;

  @TypeGraphQLField(() => HistoricalBalanceWhereInput, { nullable: true })
  historicalBalances_some?: HistoricalBalanceWhereInput;

  @TypeGraphQLField(() => HistoricalBalanceWhereInput, { nullable: true })
  historicalBalances_every?: HistoricalBalanceWhereInput;

  @TypeGraphQLField(() => AccountWhereInput, { nullable: true })
  AND?: [AccountWhereInput];

  @TypeGraphQLField(() => AccountWhereInput, { nullable: true })
  OR?: [AccountWhereInput];
}

@TypeGraphQLInputType()
export class AccountWhereUniqueInput {
  @TypeGraphQLField(() => ID)
  id?: string;
}

@TypeGraphQLInputType()
export class AccountCreateInput {
  @TypeGraphQLField()
  wallet!: string;

  @TypeGraphQLField()
  balance!: string;
}

@TypeGraphQLInputType()
export class AccountUpdateInput {
  @TypeGraphQLField({ nullable: true })
  wallet?: string;

  @TypeGraphQLField({ nullable: true })
  balance?: string;
}

@ArgsType()
export class AccountWhereArgs extends PaginationArgs {
  @TypeGraphQLField(() => AccountWhereInput, { nullable: true })
  where?: AccountWhereInput;

  @TypeGraphQLField(() => AccountOrderByEnum, { nullable: true })
  orderBy?: AccountOrderByEnum[];
}

@ArgsType()
export class AccountCreateManyArgs {
  @TypeGraphQLField(() => [AccountCreateInput])
  data!: AccountCreateInput[];
}

@ArgsType()
export class AccountUpdateArgs {
  @TypeGraphQLField() data!: AccountUpdateInput;
  @TypeGraphQLField() where!: AccountWhereUniqueInput;
}

export enum CollectionOrderByEnum {
  createdAt_ASC = "createdAt_ASC",
  createdAt_DESC = "createdAt_DESC",

  updatedAt_ASC = "updatedAt_ASC",
  updatedAt_DESC = "updatedAt_DESC",

  deletedAt_ASC = "deletedAt_ASC",
  deletedAt_DESC = "deletedAt_DESC",

  name_ASC = "name_ASC",
  name_DESC = "name_DESC",

  max_ASC = "max_ASC",
  max_DESC = "max_DESC",

  issuer_ASC = "issuer_ASC",
  issuer_DESC = "issuer_DESC",

  symbol_ASC = "symbol_ASC",
  symbol_DESC = "symbol_DESC",

  rmrkVersion_ASC = "rmrkVersion_ASC",
  rmrkVersion_DESC = "rmrkVersion_DESC",

  metadata_ASC = "metadata_ASC",
  metadata_DESC = "metadata_DESC",
}

registerEnumType(CollectionOrderByEnum, {
  name: "CollectionOrderByInput",
});

@TypeGraphQLInputType()
export class CollectionWhereInput {
  @TypeGraphQLField(() => ID, { nullable: true })
  id_eq?: string;

  @TypeGraphQLField(() => [ID], { nullable: true })
  id_in?: string[];

  @TypeGraphQLField(() => DateTime, { nullable: true })
  createdAt_eq?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  createdAt_lt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  createdAt_lte?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  createdAt_gt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  createdAt_gte?: Date;

  @TypeGraphQLField(() => ID, { nullable: true })
  createdById_eq?: string;

  @TypeGraphQLField(() => [ID], { nullable: true })
  createdById_in?: string[];

  @TypeGraphQLField(() => DateTime, { nullable: true })
  updatedAt_eq?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  updatedAt_lt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  updatedAt_lte?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  updatedAt_gt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  updatedAt_gte?: Date;

  @TypeGraphQLField(() => ID, { nullable: true })
  updatedById_eq?: string;

  @TypeGraphQLField(() => [ID], { nullable: true })
  updatedById_in?: string[];

  @TypeGraphQLField({ nullable: true })
  deletedAt_all?: Boolean;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  deletedAt_eq?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  deletedAt_lt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  deletedAt_lte?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  deletedAt_gt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  deletedAt_gte?: Date;

  @TypeGraphQLField(() => ID, { nullable: true })
  deletedById_eq?: string;

  @TypeGraphQLField(() => [ID], { nullable: true })
  deletedById_in?: string[];

  @TypeGraphQLField({ nullable: true })
  name_eq?: string;

  @TypeGraphQLField({ nullable: true })
  name_contains?: string;

  @TypeGraphQLField({ nullable: true })
  name_startsWith?: string;

  @TypeGraphQLField({ nullable: true })
  name_endsWith?: string;

  @TypeGraphQLField(() => [String], { nullable: true })
  name_in?: string[];

  @TypeGraphQLField(() => BigInt, { nullable: true })
  max_eq?: string;

  @TypeGraphQLField(() => BigInt, { nullable: true })
  max_gt?: string;

  @TypeGraphQLField(() => BigInt, { nullable: true })
  max_gte?: string;

  @TypeGraphQLField(() => BigInt, { nullable: true })
  max_lt?: string;

  @TypeGraphQLField(() => BigInt, { nullable: true })
  max_lte?: string;

  @TypeGraphQLField(() => [BigInt], { nullable: true })
  max_in?: string[];

  @TypeGraphQLField({ nullable: true })
  issuer_eq?: string;

  @TypeGraphQLField({ nullable: true })
  issuer_contains?: string;

  @TypeGraphQLField({ nullable: true })
  issuer_startsWith?: string;

  @TypeGraphQLField({ nullable: true })
  issuer_endsWith?: string;

  @TypeGraphQLField(() => [String], { nullable: true })
  issuer_in?: string[];

  @TypeGraphQLField({ nullable: true })
  symbol_eq?: string;

  @TypeGraphQLField({ nullable: true })
  symbol_contains?: string;

  @TypeGraphQLField({ nullable: true })
  symbol_startsWith?: string;

  @TypeGraphQLField({ nullable: true })
  symbol_endsWith?: string;

  @TypeGraphQLField(() => [String], { nullable: true })
  symbol_in?: string[];

  @TypeGraphQLField({ nullable: true })
  rmrkVersion_eq?: string;

  @TypeGraphQLField({ nullable: true })
  rmrkVersion_contains?: string;

  @TypeGraphQLField({ nullable: true })
  rmrkVersion_startsWith?: string;

  @TypeGraphQLField({ nullable: true })
  rmrkVersion_endsWith?: string;

  @TypeGraphQLField(() => [String], { nullable: true })
  rmrkVersion_in?: string[];

  @TypeGraphQLField({ nullable: true })
  metadata_eq?: string;

  @TypeGraphQLField({ nullable: true })
  metadata_contains?: string;

  @TypeGraphQLField({ nullable: true })
  metadata_startsWith?: string;

  @TypeGraphQLField({ nullable: true })
  metadata_endsWith?: string;

  @TypeGraphQLField(() => [String], { nullable: true })
  metadata_in?: string[];

  @TypeGraphQLField(() => CollectionWhereInput, { nullable: true })
  AND?: [CollectionWhereInput];

  @TypeGraphQLField(() => CollectionWhereInput, { nullable: true })
  OR?: [CollectionWhereInput];
}

@TypeGraphQLInputType()
export class CollectionWhereUniqueInput {
  @TypeGraphQLField(() => ID)
  id?: string;
}

@TypeGraphQLInputType()
export class CollectionCreateInput {
  @TypeGraphQLField({ nullable: true })
  name?: string;

  @TypeGraphQLField()
  max!: string;

  @TypeGraphQLField()
  issuer!: string;

  @TypeGraphQLField()
  symbol!: string;

  @TypeGraphQLField()
  rmrkVersion!: string;

  @TypeGraphQLField({ nullable: true })
  metadata?: string;
}

@TypeGraphQLInputType()
export class CollectionUpdateInput {
  @TypeGraphQLField({ nullable: true })
  name?: string;

  @TypeGraphQLField({ nullable: true })
  max?: string;

  @TypeGraphQLField({ nullable: true })
  issuer?: string;

  @TypeGraphQLField({ nullable: true })
  symbol?: string;

  @TypeGraphQLField({ nullable: true })
  rmrkVersion?: string;

  @TypeGraphQLField({ nullable: true })
  metadata?: string;
}

@ArgsType()
export class CollectionWhereArgs extends PaginationArgs {
  @TypeGraphQLField(() => CollectionWhereInput, { nullable: true })
  where?: CollectionWhereInput;

  @TypeGraphQLField(() => CollectionOrderByEnum, { nullable: true })
  orderBy?: CollectionOrderByEnum[];
}

@ArgsType()
export class CollectionCreateManyArgs {
  @TypeGraphQLField(() => [CollectionCreateInput])
  data!: CollectionCreateInput[];
}

@ArgsType()
export class CollectionUpdateArgs {
  @TypeGraphQLField() data!: CollectionUpdateInput;
  @TypeGraphQLField() where!: CollectionWhereUniqueInput;
}

export enum CallOrderByEnum {
  createdAt_ASC = "createdAt_ASC",
  createdAt_DESC = "createdAt_DESC",

  updatedAt_ASC = "updatedAt_ASC",
  updatedAt_DESC = "updatedAt_DESC",

  deletedAt_ASC = "deletedAt_ASC",
  deletedAt_DESC = "deletedAt_DESC",

  call_ASC = "call_ASC",
  call_DESC = "call_DESC",

  value_ASC = "value_ASC",
  value_DESC = "value_DESC",

  caller_ASC = "caller_ASC",
  caller_DESC = "caller_DESC",
}

registerEnumType(CallOrderByEnum, {
  name: "CallOrderByInput",
});

@TypeGraphQLInputType()
export class CallWhereInput {
  @TypeGraphQLField(() => ID, { nullable: true })
  id_eq?: string;

  @TypeGraphQLField(() => [ID], { nullable: true })
  id_in?: string[];

  @TypeGraphQLField(() => DateTime, { nullable: true })
  createdAt_eq?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  createdAt_lt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  createdAt_lte?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  createdAt_gt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  createdAt_gte?: Date;

  @TypeGraphQLField(() => ID, { nullable: true })
  createdById_eq?: string;

  @TypeGraphQLField(() => [ID], { nullable: true })
  createdById_in?: string[];

  @TypeGraphQLField(() => DateTime, { nullable: true })
  updatedAt_eq?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  updatedAt_lt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  updatedAt_lte?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  updatedAt_gt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  updatedAt_gte?: Date;

  @TypeGraphQLField(() => ID, { nullable: true })
  updatedById_eq?: string;

  @TypeGraphQLField(() => [ID], { nullable: true })
  updatedById_in?: string[];

  @TypeGraphQLField({ nullable: true })
  deletedAt_all?: Boolean;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  deletedAt_eq?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  deletedAt_lt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  deletedAt_lte?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  deletedAt_gt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  deletedAt_gte?: Date;

  @TypeGraphQLField(() => ID, { nullable: true })
  deletedById_eq?: string;

  @TypeGraphQLField(() => [ID], { nullable: true })
  deletedById_in?: string[];

  @TypeGraphQLField({ nullable: true })
  call_eq?: string;

  @TypeGraphQLField({ nullable: true })
  call_contains?: string;

  @TypeGraphQLField({ nullable: true })
  call_startsWith?: string;

  @TypeGraphQLField({ nullable: true })
  call_endsWith?: string;

  @TypeGraphQLField(() => [String], { nullable: true })
  call_in?: string[];

  @TypeGraphQLField({ nullable: true })
  value_eq?: string;

  @TypeGraphQLField({ nullable: true })
  value_contains?: string;

  @TypeGraphQLField({ nullable: true })
  value_startsWith?: string;

  @TypeGraphQLField({ nullable: true })
  value_endsWith?: string;

  @TypeGraphQLField(() => [String], { nullable: true })
  value_in?: string[];

  @TypeGraphQLField({ nullable: true })
  caller_eq?: string;

  @TypeGraphQLField({ nullable: true })
  caller_contains?: string;

  @TypeGraphQLField({ nullable: true })
  caller_startsWith?: string;

  @TypeGraphQLField({ nullable: true })
  caller_endsWith?: string;

  @TypeGraphQLField(() => [String], { nullable: true })
  caller_in?: string[];

  @TypeGraphQLField(() => CallWhereInput, { nullable: true })
  AND?: [CallWhereInput];

  @TypeGraphQLField(() => CallWhereInput, { nullable: true })
  OR?: [CallWhereInput];
}

@TypeGraphQLInputType()
export class CallWhereUniqueInput {
  @TypeGraphQLField(() => ID)
  id?: string;
}

@TypeGraphQLInputType()
export class CallCreateInput {
  @TypeGraphQLField()
  call!: string;

  @TypeGraphQLField()
  value!: string;

  @TypeGraphQLField()
  caller!: string;
}

@TypeGraphQLInputType()
export class CallUpdateInput {
  @TypeGraphQLField({ nullable: true })
  call?: string;

  @TypeGraphQLField({ nullable: true })
  value?: string;

  @TypeGraphQLField({ nullable: true })
  caller?: string;
}

@ArgsType()
export class CallWhereArgs extends PaginationArgs {
  @TypeGraphQLField(() => CallWhereInput, { nullable: true })
  where?: CallWhereInput;

  @TypeGraphQLField(() => CallOrderByEnum, { nullable: true })
  orderBy?: CallOrderByEnum[];
}

@ArgsType()
export class CallCreateManyArgs {
  @TypeGraphQLField(() => [CallCreateInput])
  data!: CallCreateInput[];
}

@ArgsType()
export class CallUpdateArgs {
  @TypeGraphQLField() data!: CallUpdateInput;
  @TypeGraphQLField() where!: CallWhereUniqueInput;
}

export enum NftOrderByEnum {
  createdAt_ASC = "createdAt_ASC",
  createdAt_DESC = "createdAt_DESC",

  updatedAt_ASC = "updatedAt_ASC",
  updatedAt_DESC = "updatedAt_DESC",

  deletedAt_ASC = "deletedAt_ASC",
  deletedAt_DESC = "deletedAt_DESC",

  collection_ASC = "collection_ASC",
  collection_DESC = "collection_DESC",

  symbol_ASC = "symbol_ASC",
  symbol_DESC = "symbol_DESC",

  transferable_ASC = "transferable_ASC",
  transferable_DESC = "transferable_DESC",

  rmrkVersion_ASC = "rmrkVersion_ASC",
  rmrkVersion_DESC = "rmrkVersion_DESC",

  sn_ASC = "sn_ASC",
  sn_DESC = "sn_DESC",

  metadata_ASC = "metadata_ASC",
  metadata_DESC = "metadata_DESC",
}

registerEnumType(NftOrderByEnum, {
  name: "NftOrderByInput",
});

@TypeGraphQLInputType()
export class NftWhereInput {
  @TypeGraphQLField(() => ID, { nullable: true })
  id_eq?: string;

  @TypeGraphQLField(() => [ID], { nullable: true })
  id_in?: string[];

  @TypeGraphQLField(() => DateTime, { nullable: true })
  createdAt_eq?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  createdAt_lt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  createdAt_lte?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  createdAt_gt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  createdAt_gte?: Date;

  @TypeGraphQLField(() => ID, { nullable: true })
  createdById_eq?: string;

  @TypeGraphQLField(() => [ID], { nullable: true })
  createdById_in?: string[];

  @TypeGraphQLField(() => DateTime, { nullable: true })
  updatedAt_eq?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  updatedAt_lt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  updatedAt_lte?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  updatedAt_gt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  updatedAt_gte?: Date;

  @TypeGraphQLField(() => ID, { nullable: true })
  updatedById_eq?: string;

  @TypeGraphQLField(() => [ID], { nullable: true })
  updatedById_in?: string[];

  @TypeGraphQLField({ nullable: true })
  deletedAt_all?: Boolean;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  deletedAt_eq?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  deletedAt_lt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  deletedAt_lte?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  deletedAt_gt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  deletedAt_gte?: Date;

  @TypeGraphQLField(() => ID, { nullable: true })
  deletedById_eq?: string;

  @TypeGraphQLField(() => [ID], { nullable: true })
  deletedById_in?: string[];

  @TypeGraphQLField({ nullable: true })
  collection_eq?: string;

  @TypeGraphQLField({ nullable: true })
  collection_contains?: string;

  @TypeGraphQLField({ nullable: true })
  collection_startsWith?: string;

  @TypeGraphQLField({ nullable: true })
  collection_endsWith?: string;

  @TypeGraphQLField(() => [String], { nullable: true })
  collection_in?: string[];

  @TypeGraphQLField({ nullable: true })
  symbol_eq?: string;

  @TypeGraphQLField({ nullable: true })
  symbol_contains?: string;

  @TypeGraphQLField({ nullable: true })
  symbol_startsWith?: string;

  @TypeGraphQLField({ nullable: true })
  symbol_endsWith?: string;

  @TypeGraphQLField(() => [String], { nullable: true })
  symbol_in?: string[];

  @TypeGraphQLField(() => BigInt, { nullable: true })
  transferable_eq?: string;

  @TypeGraphQLField(() => BigInt, { nullable: true })
  transferable_gt?: string;

  @TypeGraphQLField(() => BigInt, { nullable: true })
  transferable_gte?: string;

  @TypeGraphQLField(() => BigInt, { nullable: true })
  transferable_lt?: string;

  @TypeGraphQLField(() => BigInt, { nullable: true })
  transferable_lte?: string;

  @TypeGraphQLField(() => [BigInt], { nullable: true })
  transferable_in?: string[];

  @TypeGraphQLField({ nullable: true })
  rmrkVersion_eq?: string;

  @TypeGraphQLField({ nullable: true })
  rmrkVersion_contains?: string;

  @TypeGraphQLField({ nullable: true })
  rmrkVersion_startsWith?: string;

  @TypeGraphQLField({ nullable: true })
  rmrkVersion_endsWith?: string;

  @TypeGraphQLField(() => [String], { nullable: true })
  rmrkVersion_in?: string[];

  @TypeGraphQLField({ nullable: true })
  sn_eq?: string;

  @TypeGraphQLField({ nullable: true })
  sn_contains?: string;

  @TypeGraphQLField({ nullable: true })
  sn_startsWith?: string;

  @TypeGraphQLField({ nullable: true })
  sn_endsWith?: string;

  @TypeGraphQLField(() => [String], { nullable: true })
  sn_in?: string[];

  @TypeGraphQLField({ nullable: true })
  metadata_eq?: string;

  @TypeGraphQLField({ nullable: true })
  metadata_contains?: string;

  @TypeGraphQLField({ nullable: true })
  metadata_startsWith?: string;

  @TypeGraphQLField({ nullable: true })
  metadata_endsWith?: string;

  @TypeGraphQLField(() => [String], { nullable: true })
  metadata_in?: string[];

  @TypeGraphQLField(() => NftWhereInput, { nullable: true })
  AND?: [NftWhereInput];

  @TypeGraphQLField(() => NftWhereInput, { nullable: true })
  OR?: [NftWhereInput];
}

@TypeGraphQLInputType()
export class NftWhereUniqueInput {
  @TypeGraphQLField(() => ID)
  id?: string;
}

@TypeGraphQLInputType()
export class NftCreateInput {
  @TypeGraphQLField()
  collection!: string;

  @TypeGraphQLField({ nullable: true })
  symbol?: string;

  @TypeGraphQLField()
  transferable!: string;

  @TypeGraphQLField()
  rmrkVersion!: string;

  @TypeGraphQLField({ nullable: true })
  sn?: string;

  @TypeGraphQLField({ nullable: true })
  metadata?: string;
}

@TypeGraphQLInputType()
export class NftUpdateInput {
  @TypeGraphQLField({ nullable: true })
  collection?: string;

  @TypeGraphQLField({ nullable: true })
  symbol?: string;

  @TypeGraphQLField({ nullable: true })
  transferable?: string;

  @TypeGraphQLField({ nullable: true })
  rmrkVersion?: string;

  @TypeGraphQLField({ nullable: true })
  sn?: string;

  @TypeGraphQLField({ nullable: true })
  metadata?: string;
}

@ArgsType()
export class NftWhereArgs extends PaginationArgs {
  @TypeGraphQLField(() => NftWhereInput, { nullable: true })
  where?: NftWhereInput;

  @TypeGraphQLField(() => NftOrderByEnum, { nullable: true })
  orderBy?: NftOrderByEnum[];
}

@ArgsType()
export class NftCreateManyArgs {
  @TypeGraphQLField(() => [NftCreateInput])
  data!: NftCreateInput[];
}

@ArgsType()
export class NftUpdateArgs {
  @TypeGraphQLField() data!: NftUpdateInput;
  @TypeGraphQLField() where!: NftWhereUniqueInput;
}

export enum RmrkOrderByEnum {
  createdAt_ASC = "createdAt_ASC",
  createdAt_DESC = "createdAt_DESC",

  updatedAt_ASC = "updatedAt_ASC",
  updatedAt_DESC = "updatedAt_DESC",

  deletedAt_ASC = "deletedAt_ASC",
  deletedAt_DESC = "deletedAt_DESC",

  block_ASC = "block_ASC",
  block_DESC = "block_DESC",

  caller_ASC = "caller_ASC",
  caller_DESC = "caller_DESC",

  interactionType_ASC = "interactionType_ASC",
  interactionType_DESC = "interactionType_DESC",

  rmrkVersion_ASC = "rmrkVersion_ASC",
  rmrkVersion_DESC = "rmrkVersion_DESC",

  remark_ASC = "remark_ASC",
  remark_DESC = "remark_DESC",
}

registerEnumType(RmrkOrderByEnum, {
  name: "RmrkOrderByInput",
});

@TypeGraphQLInputType()
export class RmrkWhereInput {
  @TypeGraphQLField(() => ID, { nullable: true })
  id_eq?: string;

  @TypeGraphQLField(() => [ID], { nullable: true })
  id_in?: string[];

  @TypeGraphQLField(() => DateTime, { nullable: true })
  createdAt_eq?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  createdAt_lt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  createdAt_lte?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  createdAt_gt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  createdAt_gte?: Date;

  @TypeGraphQLField(() => ID, { nullable: true })
  createdById_eq?: string;

  @TypeGraphQLField(() => [ID], { nullable: true })
  createdById_in?: string[];

  @TypeGraphQLField(() => DateTime, { nullable: true })
  updatedAt_eq?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  updatedAt_lt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  updatedAt_lte?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  updatedAt_gt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  updatedAt_gte?: Date;

  @TypeGraphQLField(() => ID, { nullable: true })
  updatedById_eq?: string;

  @TypeGraphQLField(() => [ID], { nullable: true })
  updatedById_in?: string[];

  @TypeGraphQLField({ nullable: true })
  deletedAt_all?: Boolean;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  deletedAt_eq?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  deletedAt_lt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  deletedAt_lte?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  deletedAt_gt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  deletedAt_gte?: Date;

  @TypeGraphQLField(() => ID, { nullable: true })
  deletedById_eq?: string;

  @TypeGraphQLField(() => [ID], { nullable: true })
  deletedById_in?: string[];

  @TypeGraphQLField(() => BigInt, { nullable: true })
  block_eq?: string;

  @TypeGraphQLField(() => BigInt, { nullable: true })
  block_gt?: string;

  @TypeGraphQLField(() => BigInt, { nullable: true })
  block_gte?: string;

  @TypeGraphQLField(() => BigInt, { nullable: true })
  block_lt?: string;

  @TypeGraphQLField(() => BigInt, { nullable: true })
  block_lte?: string;

  @TypeGraphQLField(() => [BigInt], { nullable: true })
  block_in?: string[];

  @TypeGraphQLField({ nullable: true })
  caller_eq?: string;

  @TypeGraphQLField({ nullable: true })
  caller_contains?: string;

  @TypeGraphQLField({ nullable: true })
  caller_startsWith?: string;

  @TypeGraphQLField({ nullable: true })
  caller_endsWith?: string;

  @TypeGraphQLField(() => [String], { nullable: true })
  caller_in?: string[];

  @TypeGraphQLField({ nullable: true })
  interactionType_eq?: string;

  @TypeGraphQLField({ nullable: true })
  interactionType_contains?: string;

  @TypeGraphQLField({ nullable: true })
  interactionType_startsWith?: string;

  @TypeGraphQLField({ nullable: true })
  interactionType_endsWith?: string;

  @TypeGraphQLField(() => [String], { nullable: true })
  interactionType_in?: string[];

  @TypeGraphQLField({ nullable: true })
  rmrkVersion_eq?: string;

  @TypeGraphQLField({ nullable: true })
  rmrkVersion_contains?: string;

  @TypeGraphQLField({ nullable: true })
  rmrkVersion_startsWith?: string;

  @TypeGraphQLField({ nullable: true })
  rmrkVersion_endsWith?: string;

  @TypeGraphQLField(() => [String], { nullable: true })
  rmrkVersion_in?: string[];

  @TypeGraphQLField({ nullable: true })
  remark_eq?: string;

  @TypeGraphQLField({ nullable: true })
  remark_contains?: string;

  @TypeGraphQLField({ nullable: true })
  remark_startsWith?: string;

  @TypeGraphQLField({ nullable: true })
  remark_endsWith?: string;

  @TypeGraphQLField(() => [String], { nullable: true })
  remark_in?: string[];

  @TypeGraphQLField(() => GraphQLJSONObject, { nullable: true })
  extraEx_json?: JsonObject;

  @TypeGraphQLField(() => RmrkWhereInput, { nullable: true })
  AND?: [RmrkWhereInput];

  @TypeGraphQLField(() => RmrkWhereInput, { nullable: true })
  OR?: [RmrkWhereInput];
}

@TypeGraphQLInputType()
export class RmrkWhereUniqueInput {
  @TypeGraphQLField(() => ID)
  id?: string;
}

@TypeGraphQLInputType()
export class RmrkCreateInput {
  @TypeGraphQLField()
  block!: string;

  @TypeGraphQLField()
  caller!: string;

  @TypeGraphQLField()
  interactionType!: string;

  @TypeGraphQLField()
  rmrkVersion!: string;

  @TypeGraphQLField()
  remark!: string;

  @TypeGraphQLField(() => Call, { nullable: true })
  extraEx?: Call;
}

@TypeGraphQLInputType()
export class RmrkUpdateInput {
  @TypeGraphQLField({ nullable: true })
  block?: string;

  @TypeGraphQLField({ nullable: true })
  caller?: string;

  @TypeGraphQLField({ nullable: true })
  interactionType?: string;

  @TypeGraphQLField({ nullable: true })
  rmrkVersion?: string;

  @TypeGraphQLField({ nullable: true })
  remark?: string;

  @TypeGraphQLField(() => Call, { nullable: true })
  extraEx?: Call;
}

@ArgsType()
export class RmrkWhereArgs extends PaginationArgs {
  @TypeGraphQLField(() => RmrkWhereInput, { nullable: true })
  where?: RmrkWhereInput;

  @TypeGraphQLField(() => RmrkOrderByEnum, { nullable: true })
  orderBy?: RmrkOrderByEnum[];
}

@ArgsType()
export class RmrkCreateManyArgs {
  @TypeGraphQLField(() => [RmrkCreateInput])
  data!: RmrkCreateInput[];
}

@ArgsType()
export class RmrkUpdateArgs {
  @TypeGraphQLField() data!: RmrkUpdateInput;
  @TypeGraphQLField() where!: RmrkWhereUniqueInput;
}
