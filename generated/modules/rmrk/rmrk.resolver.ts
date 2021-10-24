import {
  Arg,
  Args,
  Mutation,
  Query,
  Root,
  Resolver,
  FieldResolver,
  ObjectType,
  Field,
  Int,
  ArgsType,
  Info,
  Ctx,
} from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { Inject } from 'typedi';
import { Min } from 'class-validator';
import {
  Fields,
  StandardDeleteResponse,
  UserId,
  PageInfo,
  RawFields,
  NestedFields,
  BaseContext,
} from '@subsquid/warthog';

import {
  RmrkCreateInput,
  RmrkCreateManyArgs,
  RmrkUpdateArgs,
  RmrkWhereArgs,
  RmrkWhereInput,
  RmrkWhereUniqueInput,
  RmrkOrderByEnum,
} from '../../warthog';

import { Rmrk } from './rmrk.model';
import { RmrkService } from './rmrk.service';

@ObjectType()
export class RmrkEdge {
  @Field(() => Rmrk, { nullable: false })
  node!: Rmrk;

  @Field(() => String, { nullable: false })
  cursor!: string;
}

@ObjectType()
export class RmrkConnection {
  @Field(() => Int, { nullable: false })
  totalCount!: number;

  @Field(() => [RmrkEdge], { nullable: false })
  edges!: RmrkEdge[];

  @Field(() => PageInfo, { nullable: false })
  pageInfo!: PageInfo;
}

@ArgsType()
export class ConnectionPageInputOptions {
  @Field(() => Int, { nullable: true })
  @Min(0)
  first?: number;

  @Field(() => String, { nullable: true })
  after?: string; // V3: TODO: should we make a RelayCursor scalar?

  @Field(() => Int, { nullable: true })
  @Min(0)
  last?: number;

  @Field(() => String, { nullable: true })
  before?: string;
}

@ArgsType()
export class RmrkConnectionWhereArgs extends ConnectionPageInputOptions {
  @Field(() => RmrkWhereInput, { nullable: true })
  where?: RmrkWhereInput;

  @Field(() => RmrkOrderByEnum, { nullable: true })
  orderBy?: [RmrkOrderByEnum];
}

@Resolver(Rmrk)
export class RmrkResolver {
  constructor(@Inject('RmrkService') public readonly service: RmrkService) {}

  @Query(() => [Rmrk])
  async rmrks(@Args() { where, orderBy, limit, offset }: RmrkWhereArgs, @Fields() fields: string[]): Promise<Rmrk[]> {
    return this.service.find<RmrkWhereInput>(where, orderBy, limit, offset, fields);
  }

  @Query(() => Rmrk, { nullable: true })
  async rmrkByUniqueInput(@Arg('where') where: RmrkWhereUniqueInput, @Fields() fields: string[]): Promise<Rmrk | null> {
    const result = await this.service.find(where, undefined, 1, 0, fields);
    return result && result.length >= 1 ? result[0] : null;
  }

  @Query(() => RmrkConnection)
  async rmrksConnection(
    @Args() { where, orderBy, ...pageOptions }: RmrkConnectionWhereArgs,
    @Info() info: any
  ): Promise<RmrkConnection> {
    const rawFields = graphqlFields(info, {}, { excludedFields: ['__typename'] });

    let result: any = {
      totalCount: 0,
      edges: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
    // If the related database table does not have any records then an error is thrown to the client
    // by warthog
    try {
      result = await this.service.findConnection<RmrkWhereInput>(where, orderBy, pageOptions, rawFields);
    } catch (err: any) {
      console.log(err);
      // TODO: should continue to return this on `Error: Items is empty` or throw the error
      if (!(err.message as string).includes('Items is empty')) throw err;
    }

    return result as Promise<RmrkConnection>;
  }
}
