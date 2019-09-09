FROM benardg/node-bcrypt

# Set workdir
WORKDIR /app

# Install node dependencies
COPY package.json package-lock.json ./
RUN npm install

# Setup env
ENV PORT 80

# Copy source files
COPY ./ ./

# Expose port
EXPOSE 80

# Startup command
CMD npm run migration-up \
    && npm run start
