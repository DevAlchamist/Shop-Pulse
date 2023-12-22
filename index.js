require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");

const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const crypto = require("crypto");
const JwtStrategy = require("passport-jwt").Strategy;
// const ExtractJwt = require("passport-jwt").ExtractJwt;
const path = require("path");


const endpointSecret = process.env.ENDPOINT_SECRET;

app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  (request, response) => {
    let event = request.body;
    // Only verify the event if you have an endpoint secret defined.
    // Otherwise use the basic event deserialized with JSON.parse
    if (endpointSecret) {
      // Get the signature sent by Stripe
      const signature = request.headers["stripe-signature"];
      try {
        event = stripe.webhooks.constructEvent(
          request.body,
          signature,
          endpointSecret
        );
      } catch (err) {
        console.log(`⚠️  Webhook signature verification failed.`, err.message);
        return response.sendStatus(400);
      }
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        console.log(
          `PaymentIntent for ${paymentIntent.amount} was successful!`
        );
        // Then define and call a method to handle the successful payment intent.
        // handlePaymentIntentSucceeded(paymentIntent);
        break;
      case "payment_method.attached":
        const paymentMethod = event.data.object;
        // Then define and call a method to handle the successful attachment of a PaymentMethod.
        // handlePaymentMethodAttached(paymentMethod);
        break;
      default:
        // Unexpected event type
        console.log(`Unhandled event type ${event.type}.`);
    }

    // Return a 200 response to acknowledge receipt of the event
    response.send();
  }
);



const cors = require("cors");
app.use(
  cors({
    exposedHeaders: ["X-Total-Count"],
  })
);

// app routes for authentication and authorization
const productRouter = require("./routes/Products");
const categoriesRouter = require("./routes/Category");
const brandsRouter = require("./routes/Brand");
const userRouter = require("./routes/User");
const authRouter = require("./routes/Auth");
const cartRouter = require("./routes/Cart");
const orderRouter = require("./routes/Order");
const userModel = require("./models/User");
const { isAuth, sanitizeUser, cookieExtractor } = require("./services/common");

// JWT options
const opts = {};
opts.jwtFromRequest = cookieExtractor;
opts.secretOrKey = process.env.JWT_SECRET_KEY;
// middleware
app.use(express.static(path.resolve(__dirname,"build")));
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_KEY,
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
  })
  );
  
  
  app.use(passport.authenticate("session"));
  
  app.use(express.json()); //! To parse req.body as JSON
  
mongoose
.connect(process.env.MONGODB_CONNECT)
.then((res) => console.log("mongo Connected"))
.catch((error) => console.log(error));

app.use("/products", isAuth(), productRouter);
app.use("/categories", isAuth(), categoriesRouter);
app.use("/brands", isAuth(), brandsRouter);
app.use("/user", isAuth(), userRouter);
app.use("/auth", authRouter);
app.use("/cart", isAuth(), cartRouter);
app.use("/orders", isAuth(), orderRouter);
// Passport strategies
passport.use(
  "local",
  new LocalStrategy({ usernameField: "email" }, async function (
    email,
    password,
    done
  ) {
    try {
      const user = await userModel.findOne({ email: email }).exec();

      if (!user) {
        done(null, false, { message: "No User Found" });
      }
      
      crypto.pbkdf2(
        password,
        user.salt,
        310000,
        32,
        "sha256",
        async function (err, hashedPassword) {
          if (!crypto.timingSafeEqual(user.password, hashedPassword)) {
            done(null, false, { message: "Wrong Password" });
          }
          const token = jwt.sign(sanitizeUser(user), process.env.JWT_SECRET_KEY);
          done(null, { id: user.id, role: user.role, token });
        }
        );
      } catch (error) {
        done(error);
      }
    })
    );
    
    passport.use(
      "jwt",
      new JwtStrategy(opts, async function (jwt_payload, done) {
        console.log({ jwt_payload });
        try {
          const user = await userModel.findById(jwt_payload.id);
      if (user) {
        return done(null, sanitizeUser(user)); // this calls serializer
      } else {
        // or you could create a new account
        return done(null, false);
      }
    } catch (err) {
      return done(err, false);
    }
  })
  );
  
  // used to create session variable when req.user is being called from callbacks
  passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
      console.log("serializing ", user);
    return cb(null, { id: user.id, role: user.role });
  });
});

// used to change or populate session variable when req.user is being called from auth
passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    console.log("deserializing ", user);
    return cb(null, user);
  });
});

// web hook
// This is your test secret API key.
// Replace this endpoint secret with your endpoint's unique secret
// If you are testing with the CLI, find the secret by running 'stripe listen'
// If you are using an endpoint defined with the API or dashboard, look in your webhook settings
// at https://dashboard.stripe.com/webhooks

// payment Gateway
// This is your test secret API key.
const stripe = require("stripe")(process.env.STRIPE_SERVER_KEY);

app.post("/create-payment-intent", async (req, res) => {
  const { totalAmount,orderId } = req.body;
  console.log(totalAmount);
  
  // user billing info had to make dynamic (static : for just testing purposes)
  const customer = await stripe.customers.create({
    name: "Jenny Rosen",
    address: {
      line1: "510 Townsend St",
      postal_code: "98140",
      city: "San Francisco",
      state: "CA",
      country: "US",
    },
  });
  
  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalAmount * 100, // for decimal compensation
    currency: "inr",
    description: "Software development services",
    customer: customer.id,
    // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
    automatic_payment_methods: {
      enabled: true,
    },
    metadata:{
      order_id: orderId
    }
  });
  
  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});

app.get('*',(req,res)=>{
  res.sendFile(path.join(__dirname,'build', 'index.html'))
})

app.listen(process.env.PORT, () => console.log("server started"));
