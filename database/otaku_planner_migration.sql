CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    profile_image TEXT NULL,
    is_admin TINYINT(1) NOT NULL DEFAULT 0,
    is_verified TINYINT(1) NOT NULL DEFAULT 0,
    verification_token VARCHAR(100) NULL,
    reset_password_expires DATETIME NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    reset_password_otp VARCHAR(6) NULL,
    reset_password_otp_expires DATETIME NULL,
    reset_password_token VARCHAR(100) NULL,
    has_completed_setup TINYINT(1) NOT NULL DEFAULT 0,
    preferred_mode ENUM('normal','anime') NOT NULL DEFAULT 'normal',
    age INT NULL,
    gender VARCHAR(255) NULL
);

CREATE TABLE IF NOT EXISTS categories (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    user_id INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tasks (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    date VARCHAR(30) NOT NULL,
    category VARCHAR(50) NOT NULL,
    time VARCHAR(5) NOT NULL,
    completed TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sequelizemeta (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    task_id INT UNSIGNED NOT NULL,
    remind_at DATETIME NOT NULL,
    is_sent BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS notifications (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    task_id INT UNSIGNED NULL,
    recurring_task_id INT UNSIGNED NULL,
    type ENUM('task_reminder','task_due','task_overdue','task_completed','automation_confirmation','recurring_instance') DEFAULT 'task_reminder',
    title VARCHAR(255) NULL,
    message TEXT NULL,
    scheduled_time DATETIME NULL,
    sent_at DATETIME NULL,
    status ENUM('pending','sent','read','dismissed') DEFAULT 'pending',
    metadata JSON NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS recurring_tasks (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    date VARCHAR(30) NOT NULL,
    category VARCHAR(50) NOT NULL,
    time VARCHAR(5) NOT NULL,
    frequency VARCHAR(100) NOT NULL DEFAULT 'One-time',
    completed TINYINT(1) NOT NULL DEFAULT 0,
    completed_instances JSON NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    excluded_dates JSON NULL,
    recurrence_end VARCHAR(20) NULL,
    custom_pattern JSON NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS admins(
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);