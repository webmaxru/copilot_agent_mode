-- Seed data: default user accounts
-- Passwords: admin user = 'admin123', regular user = 'user1234'
INSERT INTO users (email, password_hash, name, role) VALUES
    ('admin@github.com', '2a55ec229a234af5674125fc39868abc:aa19bd0c8ffd4c6ba927cfe08885678d4356d996e360db78207855ebcf63364b9d67354b2e24a837675ae100ea9f06313466c8a9afc15e1c7154397178525683', 'Admin User', 'admin'),
    ('user@example.com', '189d0438941db1deb15302f68139be65:09d4e4ba164546fd11e77e6ddfbf5b77b82427d74a901df9e8e9ca784628337480353f35e73c85cd4d5096daafef21e464d6d6a45e3c1e30b08bb1c57cbdf6f5', 'Regular User', 'user');
