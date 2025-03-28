import bcrypt from "bcryptjs";

const testPassword = async () => {
  // The stored password hash from your server logs
  const storedHash = "$2a$10$Jxfz3ekbwukiJ3SLINrUvO3RL1ImVawcGzIoPdJ4WR.mw.ibBm8i.";
  
  console.log("Testing password verification with fixed inputs");
  
  // Test various passwords against the stored hash
  const passwords = [
    "test123",
    "password123",
    "99220040808",  // One of the passwords tried in the logs
    "123456",
    "password",
    "Test123",  // Case sensitivity check
    "test123 "  // Space check
  ];
  
  for (const password of passwords) {
    try {
      console.log(`Testing password: "${password}"`);
      const isMatch = await bcrypt.compare(password, storedHash);
      console.log(`Match result: ${isMatch}`);
    } catch (error) {
      console.error(`Error comparing "${password}":`, error);
    }
  }
  
  // Generate a new hash for test123 to see if it's consistent
  try {
    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash("test123", salt);
    console.log(`\nNew hash for "test123": ${newHash}`);
    
    // Verify the new hash works
    const verifyNew = await bcrypt.compare("test123", newHash);
    console.log(`Verification of new hash: ${verifyNew}`);
  } catch (error) {
    console.error("Error generating new hash:", error);
  }
  
  // Test if the bcrypt implementation is working correctly in general
  try {
    const testSalt = await bcrypt.genSalt(10);
    const testHash = await bcrypt.hash("testpassword", testSalt);
    const testVerify = await bcrypt.compare("testpassword", testHash);
    console.log(`\nGeneral bcrypt test - hash: ${testHash}`);
    console.log(`General bcrypt test - verify: ${testVerify}`);
  } catch (error) {
    console.error("Error in general bcrypt test:", error);
  }
};

testPassword(); 