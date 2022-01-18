import { BaseModel, NumericField, Model, StringField, JSONField } from '@subsquid/warthog';

import BN from 'bn.js';

import * as jsonTypes from '../jsonfields/jsonfields.model';

@Model({ api: {} })
export class Nft extends BaseModel {
  @NumericField({
    unique: true,
    transformer: {
      to: (entityValue: BN) => (entityValue !== undefined ? entityValue.toString(10) : null),
      from: (dbValue: string) =>
        dbValue !== undefined && dbValue !== null && dbValue.length > 0 ? new BN(dbValue, 10) : undefined,
    },
  })
  idIndexing!: BN;

  @StringField({})
  collection!: string;

  @StringField({
    nullable: true,
  })
  symbol?: string;

  @NumericField({
    transformer: {
      to: (entityValue: BN) => (entityValue !== undefined ? entityValue.toString(10) : null),
      from: (dbValue: string) =>
        dbValue !== undefined && dbValue !== null && dbValue.length > 0 ? new BN(dbValue, 10) : undefined,
    },
  })
  transferable!: BN;

  @StringField({
    nullable: true,
  })
  rmrkVersion?: string;

  @StringField({
    nullable: true,
  })
  sn?: string;

  @StringField({
    nullable: true,
  })
  metadata?: string;

  @NumericField({
    transformer: {
      to: (entityValue: BN) => (entityValue !== undefined ? entityValue.toString(10) : null),
      from: (dbValue: string) =>
        dbValue !== undefined && dbValue !== null && dbValue.length > 0 ? new BN(dbValue, 10) : undefined,
    },
  })
  block!: BN;

  constructor(init?: Partial<Nft>) {
    super();
    Object.assign(this, init);
  }
}
