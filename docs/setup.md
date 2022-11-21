# Setup for developement

Install all dependencies

```bash
npm install
```

Add secret to connect to PostgreSQL database

```bash
echo '{"url": "{Get from Heroku Dashboard}"}' >> secrets.json
```

Start the service locally

```bash
npm run devStart
```

Now, navigate to localhost:3000 in your browser of choice.
