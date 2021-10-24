import { BaseModel, Model, StringField, JSONField } from '@subsquid/warthog';

import * as jsonTypes from '../jsonfields/jsonfields.model';

@Model({ api: {} })
export class RmrkEntity extends BaseModel {
  @JSONField({ filter: true, gqlFieldType: jsonTypes.Rmrk })
  rmrk!: jsonTypes.Rmrk;

  constructor(init?: Partial<RmrkEntity>) {
    super();
    Object.assign(this, init);
  }
}
