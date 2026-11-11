-- Categories belong to a user, but the name column was unique across everyone,
-- so once one user had "Study" nobody else could create it.
-- Run once on an existing database. It keeps every row and only swaps the index.
ALTER TABLE categories
    DROP INDEX name,
    ADD UNIQUE KEY categories_user_name (user_id, name);
