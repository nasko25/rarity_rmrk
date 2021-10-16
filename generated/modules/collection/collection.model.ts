import { BaseModel, NumericField, Model, StringField, JSONField } from '@subsquid/warthog';

import BN from 'bn.js';

import * as jsonTypes from '../jsonfields/jsonfields.model';

@Model({ api: {} })
export class Collection extends BaseModel {
  @StringField({})
  name!: string;

  @NumericField({
    transformer: {
      to: (entityValue: BN) => (entityValue !== undefined ? entityValue.toString(10) : null),
      from: (dbValue: string) =>
        dbValue !== undefined && dbValue !== null && dbValue.length > 0 ? new BN(dbValue, 10) : undefined,
    },
  })
  max!: BN;

  @StringField({})
  issuer!: string;

  @StringField({})
  symbol!: string;

  @StringField({})
  rmrkVersion!: string;

  @StringField({
    nullable: true,
  })
  metadata?: string;

  constructor(init?: Partial<Collection>) {
    super();
    Object.assign(this, init);
  }
}
