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
  NftCreateInput,
  NftCreateManyArgs,
  NftUpdateArgs,
  NftWhereArgs,
  NftWhereInput,
  NftWhereUniqueInput,
  NftOrderByEnum,
} from '../../warthog';

import { Nft } from './nft.model';
import { NftService } from './nft.service';

@ObjectType()
export class NftEdge {
  @Field(() => Nft, { nullable: false })
  node!: Nft;

  @Field(() => String, { nullable: false })
  cursor!: string;
}

@ObjectType()
export class NftConnection {
  @Field(() => Int, { nullable: false })
  totalCount!: number;

  @Field(() => [NftEdge], { nullable: false })
  edges!: NftEdge[];

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
export class NftConnectionWhereArgs extends ConnectionPageInputOptions {
  @Field(() => NftWhereInput, { nullable: true })
  where?: NftWhereInput;

  @Field(() => NftOrderByEnum, { nullable: true })
  orderBy?: [NftOrderByEnum];
}

@Resolver(Nft)
export class NftResolver {
  constructor(@Inject('NftService') public readonly service: NftService) {}

  @Query(() => [Nft])
  async nfts(@Args() { where, orderBy, limit, offset }: NftWhereArgs, @Fields() fields: string[]): Promise<Nft[]> {
    return this.service.find<NftWhereInput>(where, orderBy, limit, offset, fields);
  }

  @Query(() => Nft, { nullable: true })
  async nftByUniqueInput(@Arg('where') where: NftWhereUniqueInput, @Fields() fields: string[]): Promise<Nft | null> {
    const result = await this.service.find(where, undefined, 1, 0, fields);
    return result && result.length >= 1 ? result[0] : null;
  }

  @Query(() => NftConnection)
  async nftsConnection(
    @Args() { where, orderBy, ...pageOptions }: NftConnectionWhereArgs,
    @Info() info: any
  ): Promise<NftConnection> {
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
      result = await this.service.findConnection<NftWhereInput>(where, orderBy, pageOptions, rawFields);
    } catch (err: any) {
      console.log(err);
      // TODO: should continue to return this on `Error: Items is empty` or throw the error
      if (!(err.message as string).includes('Items is empty')) throw err;
    }

    return result as Promise<NftConnection>;
  }
}
