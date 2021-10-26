import { BaseModel, NumericField, Model, StringField, JSONField } from '@subsquid/warthog';

import BN from 'bn.js';

import * as jsonTypes from '../jsonfields/jsonfields.model';

@Model({ api: {} })
export class RmrkEntity extends BaseModel {
  @NumericField({
    transformer: {
      to: (entityValue: BN) => (entityValue !== undefined ? entityValue.toString(10) : null),
      from: (dbValue: string) =>
        dbValue !== undefined && dbValue !== null && dbValue.length > 0 ? new BN(dbValue, 10) : undefined,
    },
  })
  block!: BN;

  @JSONField({ filter: true, gqlFieldType: jsonTypes.Rmrk })
  rmrk!: jsonTypes.Rmrk;

  constructor(init?: Partial<RmrkEntity>) {
    super();
    Object.assign(this, init);
  }
}
