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
  RmrkEntityCreateInput,
  RmrkEntityCreateManyArgs,
  RmrkEntityUpdateArgs,
  RmrkEntityWhereArgs,
  RmrkEntityWhereInput,
  RmrkEntityWhereUniqueInput,
  RmrkEntityOrderByEnum,
} from '../../warthog';

import { RmrkEntity } from './rmrk-entity.model';
import { RmrkEntityService } from './rmrk-entity.service';

@ObjectType()
export class RmrkEntityEdge {
  @Field(() => RmrkEntity, { nullable: false })
  node!: RmrkEntity;

  @Field(() => String, { nullable: false })
  cursor!: string;
}

@ObjectType()
export class RmrkEntityConnection {
  @Field(() => Int, { nullable: false })
  totalCount!: number;

  @Field(() => [RmrkEntityEdge], { nullable: false })
  edges!: RmrkEntityEdge[];

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
export class RmrkEntityConnectionWhereArgs extends ConnectionPageInputOptions {
  @Field(() => RmrkEntityWhereInput, { nullable: true })
  where?: RmrkEntityWhereInput;

  @Field(() => RmrkEntityOrderByEnum, { nullable: true })
  orderBy?: [RmrkEntityOrderByEnum];
}

@Resolver(RmrkEntity)
export class RmrkEntityResolver {
  constructor(@Inject('RmrkEntityService') public readonly service: RmrkEntityService) {}

  @Query(() => [RmrkEntity])
  async rmrkEntities(
    @Args() { where, orderBy, limit, offset }: RmrkEntityWhereArgs,
    @Fields() fields: string[]
  ): Promise<RmrkEntity[]> {
    return this.service.find<RmrkEntityWhereInput>(where, orderBy, limit, offset, fields);
  }

  @Query(() => RmrkEntity, { nullable: true })
  async rmrkEntityByUniqueInput(
    @Arg('where') where: RmrkEntityWhereUniqueInput,
    @Fields() fields: string[]
  ): Promise<RmrkEntity | null> {
    const result = await this.service.find(where, undefined, 1, 0, fields);
    return result && result.length >= 1 ? result[0] : null;
  }

  @Query(() => RmrkEntityConnection)
  async rmrkEntitiesConnection(
    @Args() { where, orderBy, ...pageOptions }: RmrkEntityConnectionWhereArgs,
    @Info() info: any
  ): Promise<RmrkEntityConnection> {
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
      result = await this.service.findConnection<RmrkEntityWhereInput>(where, orderBy, pageOptions, rawFields);
    } catch (err: any) {
      console.log(err);
      // TODO: should continue to return this on `Error: Items is empty` or throw the error
      if (!(err.message as string).includes('Items is empty')) throw err;
    }

    return result as Promise<RmrkEntityConnection>;
  }
}
