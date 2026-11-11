-- Task dates are stored like 2026-11-09T00:00:00.000Z (24 characters), which
-- didn't fit the old VARCHAR(20) columns, so adding a task failed.
-- Run once on an existing database. It only widens the columns.
ALTER TABLE tasks MODIFY date VARCHAR(30) NOT NULL;
ALTER TABLE recurring_tasks MODIFY date VARCHAR(30) NOT NULL;
