const Koa = require('koa');

const app = new Koa();

app.use(async (ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', "*");
  next();
});

app.use(async ctx => {
  // console.log('1: ', ctx.request.query);
  // console.log('2: ', ctx.query);
  ctx.body = {
    code: 0
  }
});

app.listen(4000);
