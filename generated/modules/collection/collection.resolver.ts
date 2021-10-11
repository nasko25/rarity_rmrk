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
  CollectionCreateInput,
  CollectionCreateManyArgs,
  CollectionUpdateArgs,
  CollectionWhereArgs,
  CollectionWhereInput,
  CollectionWhereUniqueInput,
  CollectionOrderByEnum,
} from '../../warthog';

import { Collection } from './collection.model';
import { CollectionService } from './collection.service';

@ObjectType()
export class CollectionEdge {
  @Field(() => Collection, { nullable: false })
  node!: Collection;

  @Field(() => String, { nullable: false })
  cursor!: string;
}

@ObjectType()
export class CollectionConnection {
  @Field(() => Int, { nullable: false })
  totalCount!: number;

  @Field(() => [CollectionEdge], { nullable: false })
  edges!: CollectionEdge[];

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
export class CollectionConnectionWhereArgs extends ConnectionPageInputOptions {
  @Field(() => CollectionWhereInput, { nullable: true })
  where?: CollectionWhereInput;

  @Field(() => CollectionOrderByEnum, { nullable: true })
  orderBy?: [CollectionOrderByEnum];
}

@Resolver(Collection)
export class CollectionResolver {
  constructor(@Inject('CollectionService') public readonly service: CollectionService) {}

  @Query(() => [Collection])
  async collections(
    @Args() { where, orderBy, limit, offset }: CollectionWhereArgs,
    @Fields() fields: string[]
  ): Promise<Collection[]> {
    return this.service.find<CollectionWhereInput>(where, orderBy, limit, offset, fields);
  }

  @Query(() => Collection, { nullable: true })
  async collectionByUniqueInput(
    @Arg('where') where: CollectionWhereUniqueInput,
    @Fields() fields: string[]
  ): Promise<Collection | null> {
    const result = await this.service.find(where, undefined, 1, 0, fields);
    return result && result.length >= 1 ? result[0] : null;
  }

  @Query(() => CollectionConnection)
  async collectionsConnection(
    @Args() { where, orderBy, ...pageOptions }: CollectionConnectionWhereArgs,
    @Info() info: any
  ): Promise<CollectionConnection> {
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
      result = await this.service.findConnection<CollectionWhereInput>(where, orderBy, pageOptions, rawFields);
    } catch (err: any) {
      console.log(err);
      // TODO: should continue to return this on `Error: Items is empty` or throw the error
      if (!(err.message as string).includes('Items is empty')) throw err;
    }

    return result as Promise<CollectionConnection>;
  }
}
