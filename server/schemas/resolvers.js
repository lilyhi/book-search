const { AuthenticationError } = require('apollo-server-express');
const {  User } = require('../models');
const { signToken } = require('../utils/auth');


const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id })
          .select('-__v -password')
    
        return userData;
      }

      throw new AuthenticationError('Not logged in');
    },

    Mutation: {
     
      addUser: async (parent, args) => {
        const user = await User.create(args);
        const token = signToken(user);
  
        return { token, user };
      },
      login: async (parent, { email, password }) => {
        const user = await User.findOne({ email });
      
        if (!user) {
          throw new AuthenticationError('Incorrect credentials');
        }
      
        const correctPw = await user.isCorrectPassword(password);
      
        if (!correctPw) {
          throw new AuthenticationError('Incorrect credentials');
        }
        
        const token = signToken(user);
        return { token, user };
      },
      // saveBook: async(parent, args, context) => {
      //   console.log('saveBook', args)
      //   if (context.user) {
      //     const book = await Book.create({ ...args, username: context.user.username });

      //     await User.findByIdAndUpdate(
      //       { _id: context.user._id},
      //       { $push: { books: book._id } },
      //       { new: true }
      //     );

      //     return book;
      //   }

      //   throw new AuthenticationError('You need to be logged in!');
      // },
      // removeBook: async(parent, args, context) => {
      //   if (context.user) {
      //     const deleteBook = await.
      //   }
      // }

      // check saveBook and write removeBook

      saveBook: async (parent, { bookData }, context) => {
        if (context.user) {
          const updatedUser = await User.findOneAndUpdate(
            { _id: context.user._id },
            { $push: { savedBooks: { bookData, username: context.user.username } } },
            { new: true, runValidators: true }
          );
      
          return updatedUser;
        }
      
        throw new AuthenticationError('You need to be logged in!');
      },
      removeBook: async (parent, { bookID }, context) => {
        if (context.user) {
          const deleteBook = await User.findOneAndUpdate(
            { _id: context.user._id },
            { $pull: { savedBooks: { bookID, username: context.user.username } } },
            { new: true, runValidators: true }
          );
      
          return deleteBook;
        }
      
        throw new AuthenticationError('You need to be logged in!');
      },
    }
  }
};

module.exports = resolvers;