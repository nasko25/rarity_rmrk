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
