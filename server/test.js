const bcrypt = require('bcryptjs');
console.log(bcrypt.compareSync('Password@123', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TqzneflfihqWrerXhLORkqQR8ZDK'));
