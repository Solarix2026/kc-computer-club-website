import { Client, Databases } from 'appwrite';

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');

// For this script, we need to set the API key for admin access
const adminApiKey = process.env.APPWRITE_API_KEY || '';
if (adminApiKey) {
  (client as any).setKey(adminApiKey);
}

const databases = new Databases(client);

async function addClubSettingsAttributes() {
  try {
    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'main';
    const collectionId = 'clubSettings';

    console.log('Adding attributes to clubSettings collection...');
    console.log('Database ID:', databaseId);
    console.log('Collection ID:', collectionId);

    // Add website attribute (URL/String)
    try {
      await (databases as any).createStringAttribute(
        databaseId,
        collectionId,
        'website',
        255,
        false // optional
      );
      console.log('✓ Added website attribute');
    } catch (error: any) {
      if (error.code === 409 || error.message?.includes('Attribute already exists')) {
        console.log('✓ website attribute already exists');
      } else {
        console.error('Error adding website attribute:', error.message);
      }
    }

    // Add logoUrl attribute (URL/String)
    try {
      await (databases as any).createStringAttribute(
        databaseId,
        collectionId,
        'logoUrl',
        500,
        false // optional
      );
      console.log('✓ Added logoUrl attribute');
    } catch (error: any) {
      if (error.code === 409 || error.message?.includes('Attribute already exists')) {
        console.log('✓ logoUrl attribute already exists');
      } else {
        console.error('Error adding logoUrl attribute:', error.message);
      }
    }

    console.log('\n✓ All attributes added successfully!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addClubSettingsAttributes();
