import {
  BaseModel,
  BooleanField,
  DateField,
  FloatField,
  IntField,
  NumericField,
  JSONField,
  BytesField,
  EnumField,
  StringField,
  ObjectType,
} from '@subsquid/warthog';
import BN from 'bn.js';
import { InputType, Field } from 'type-graphql';

@InputType('CallInput')
@ObjectType()
export class Call {
  @StringField({})
  call!: string;

  @StringField({})
  value!: string;

  @StringField({})
  caller!: string;
}

@InputType('RmrkInput')
@ObjectType()
export class Rmrk {
  @StringField({})
  caller!: string;

  @StringField({})
  interactionType!: string;

  @StringField({})
  rmrkVersion!: string;

  @StringField({})
  remark!: string;

  @Field(() => [Call], { nullable: true })
  extraEx?: Call[];
}
