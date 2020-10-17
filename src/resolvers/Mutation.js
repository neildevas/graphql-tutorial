const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { APP_SECRET, getUserId } = require('../utils');

async function signup(parent, args, context) {
  const password = await bcrypt.hash(args.password, 10);
  const user = await context.prisma.user.create({ data: { ...args, password } });
  const token = jwt.sign({ userId: user.id }, APP_SECRET);
  return {
    token,
    user,
  }
}

async function login(parent, args, context) {
  const user = await context.prisma.user.findOne({ where: { email: args.email } });
  if (!user) {
    throw new Error('No such user found')
  }
  const valid = await bcrypt.compare(args.password, user.password);
  if (!valid) {
    throw new Error('Invalid password')
  }
  const token = jwt.sign({ userId: user.id }, APP_SECRET);
  return {
    token,
    user,
  }
}

async function createPost(parent, args, context) {
  const userId = getUserId(context);
  return context.prisma.link.create({
    data: {
      ...args,
      postedBy: {
        connect: { id: userId },
      }
    }
  })
}

module.exports = {
  signup,
  login,
};