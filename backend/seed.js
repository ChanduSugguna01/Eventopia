const mongoose = require('mongoose');
const User = require('./models/User');
const Event = require('./models/Event');
require('dotenv').config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/event_booking');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Event.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@eventbooking.com',
      password: 'admin123',
      role: 'admin'
    });
    console.log('Created admin user:', admin.email);

    // Create regular user
    const user = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'user'
    });
    console.log('Created regular user:', user.email);

    // Create sample events
    const events = await Event.create([
      {
        title: 'Rock Music Festival 2025',
        description: 'Join us for an amazing rock music festival featuring top bands from around the world. Experience the thrill of live rock music with thousands of fans.',
        date: new Date('2025-12-15T18:00:00'),
        venue: 'Mumbai Stadium',
        category: 'Concert',
        totalSeats: 5000,
        ticketPrice: 1500,
        imageUrl: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400',
        organizer: admin._id,
        status: 'upcoming'
      },
      {
        title: 'Tech Conference 2025',
        description: 'Annual technology conference featuring keynotes from industry leaders, hands-on workshops, and networking opportunities.',
        date: new Date('2025-11-20T09:00:00'),
        venue: 'Bangalore Convention Center',
        category: 'Conference',
        totalSeats: 1000,
        ticketPrice: 2500,
        imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400',
        organizer: admin._id,
        status: 'upcoming'
      },
      {
        title: 'Comedy Night Special',
        description: 'Laugh out loud with the best stand-up comedians in the country. A night full of humor and entertainment.',
        date: new Date('2025-11-10T20:00:00'),
        venue: 'Delhi Auditorium',
        category: 'Theater',
        totalSeats: 500,
        ticketPrice: 800,
        imageUrl: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=400',
        organizer: admin._id,
        status: 'upcoming'
      },
      {
        title: 'IPL Cricket Match',
        description: 'Watch your favorite teams battle it out in this exciting IPL cricket match. Don\'t miss the action!',
        date: new Date('2025-11-25T19:30:00'),
        venue: 'Chennai Cricket Stadium',
        category: 'Sports',
        totalSeats: 40000,
        ticketPrice: 1200,
        imageUrl: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=400',
        organizer: admin._id,
        status: 'upcoming'
      },
      {
        title: 'Classical Music Concert',
        description: 'An evening of classical Indian music performed by renowned artists. Experience the beauty of traditional ragas.',
        date: new Date('2025-12-01T18:00:00'),
        venue: 'Kolkata Music Hall',
        category: 'Concert',
        totalSeats: 800,
        ticketPrice: 1000,
        imageUrl: 'https://images.unsplash.com/photo-1511735111819-9a3f7709049c?w=400',
        organizer: admin._id,
        status: 'upcoming'
      },
      {
        title: 'Food & Wine Festival',
        description: 'Indulge in gourmet food and fine wines from around the world. A festival for food lovers and connoisseurs.',
        date: new Date('2025-11-18T12:00:00'),
        venue: 'Goa Beach Resort',
        category: 'Festival',
        totalSeats: 2000,
        ticketPrice: 3000,
        imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400',
        organizer: admin._id,
        status: 'upcoming'
      }
    ]);

    console.log(`Created ${events.length} sample events`);

    console.log('\n=== Seed Data Summary ===');
    console.log('Admin Login:');
    console.log('  Email: admin@eventbooking.com');
    console.log('  Password: admin123');
    console.log('\nRegular User Login:');
    console.log('  Email: john@example.com');
    console.log('  Password: password123');
    console.log('\nDatabase seeded successfully!');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
