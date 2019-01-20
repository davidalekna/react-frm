export const minLength = min => value => {
  return value.length < min ? `Must be ${min} characters or more` : undefined;
};

export const mustContainLetter = letter => value => {
  return !value.includes(letter) ? `Must contain letter ${letter}` : undefined;
};
