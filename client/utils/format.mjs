export const normalizeEmail = (email) => {
  console.log('Normalizing email:', email);
  // Remove any whitespace and convert to lowercase
  const normalized = email.trim().toLowerCase();
  // Remove any dots from the local part (before @)
  const [localPart, domain] = normalized.split('@');
  const normalizedLocalPart = localPart.replace(/\./g, '');
  const finalEmail = `${normalizedLocalPart}@${domain}`;
  console.log('Normalized email:', finalEmail);
  return finalEmail;
};

export const isValidEmail = (email) => {
  const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return regex.test(email);
};

// Password validation (At least one uppercase, one lowercase, one number, one special character, and 8 characters long)
export const isValidPassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

export default isValidEmail;
