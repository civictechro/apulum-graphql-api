import * as yup from "yup";

import { ResolverMap } from "../../types/graphql-utils";
import { User } from '../../entity/User';
import { getRepository } from "typeorm";
import { userDoesntExist } from "./errorMessages";
import { formatYupError } from "../../utils/formatYupError";

const schema = yup.object().shape({
  firstName: yup
    .string()
    .max(255),
  lastName: yup
    .string()
    .max(256),
});

export const resolvers: ResolverMap = {
  MaybeUser: {
    __resolveType: (obj) => {
      if (obj.path) {
        return 'Error';
      }

      return 'User';
    },
  },
  Query: {
    users: async () => {
      return getRepository(User)
        .createQueryBuilder('user')
        .getMany();
    },
    user: async (_, { id }: GQL.IUserOnQueryArguments) => {
      return User.findOne({
        where: { id },
      });
    },
  },
  Mutation: {
    updateUser: async (_, {id, firstName, lastName}: GQL.IUpdateUserOnMutationArguments) => {
      try {
        await schema.validate({id, firstName, lastName}, { abortEarly: false });
      } catch(err) {
        return formatYupError(err);
      }

      const user = await User.findOne({
        where: { id },
        select: ['id', 'email', 'firstName', 'lastName']
      });

      if (!user) {
        return [{
          path: 'user',
          message: userDoesntExist
        }]
      }

      if (firstName) {
        user.firstName = firstName;
      }

      if (lastName) {
        user.lastName = lastName;
      }

      await user.save();
      return [user];
    }
  }
}

