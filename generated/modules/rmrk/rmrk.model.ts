import { BaseModel, NumericField, Model, StringField, JSONField } from '@subsquid/warthog';

import BN from 'bn.js';

import * as jsonTypes from '../jsonfields/jsonfields.model';

@Model({ api: {} })
export class Rmrk extends BaseModel {
  @NumericField({
    transformer: {
      to: (entityValue: BN) => (entityValue !== undefined ? entityValue.toString(10) : null),
      from: (dbValue: string) =>
        dbValue !== undefined && dbValue !== null && dbValue.length > 0 ? new BN(dbValue, 10) : undefined,
    },
  })
  block!: BN;

  @StringField({})
  caller!: string;

  @StringField({})
  interactionType!: string;

  @StringField({})
  rmrkVersion!: string;

  @StringField({})
  remark!: string;

  @JSONField({ filter: true, gqlFieldType: jsonTypes.Call, nullable: true })
  extraEx?: jsonTypes.Call;

  constructor(init?: Partial<Rmrk>) {
    super();
    Object.assign(this, init);
  }
}
