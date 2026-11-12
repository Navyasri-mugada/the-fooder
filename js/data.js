// The Fooder - Andhra Food Restaurant
// Data accurately extracted from official specifications

const RESTAURANT_DATA = {
  brand: {
    name: "The Fooder",
    tagline: "Real Andhra flavour, from Vijayawada to your table.",
    description: "At The Fooder we serve gongura pickle, pappu, ghee and fiery curries cooked the way Vijayawada cooks them. Order for delivery or book a table in your city.",
    notice: "Phone numbers, addresses and the UPI ID in this document are placeholders.",
    freeSweetOfferThreshold: 500,
    freeSweetDishName: "Bobbatlu"
  },

  branches: [
    {
      id: "vijayawada",
      city: "Vijayawada",
      address: "MG Road, Labbipet",
      phone: "+91 98480 00001",
      openTime: "11:00 AM",
      closeTime: "10:30 PM",
      openHours: "11:00 am - 10:30 pm",
      deliveryTime: "30-40 min",
      popularLandmark: "Beside Benz Circle Hub",
      isFlagship: true
    },
    {
      id: "guntur",
      city: "Guntur",
      address: "Brodipet 3rd Lane",
      phone: "+91 98480 00002",
      openTime: "11:00 AM",
      closeTime: "10:00 PM",
      openHours: "11:00 am - 10:00 pm",
      deliveryTime: "35-45 min",
      popularLandmark: "Near Arundalpet Junction",
      isFlagship: false
    },
    {
      id: "eluru",
      city: "Eluru",
      address: "Powerpet Main Road",
      phone: "+91 98480 00003",
      openTime: "11:30 AM",
      closeTime: "10:00 PM",
      openHours: "11:30 am - 10:00 pm",
      deliveryTime: "35-45 min",
      popularLandmark: "Near Railway Overbridge",
      isFlagship: false
    },
    {
      id: "machilipatnam",
      city: "Machilipatnam",
      address: "Chilakalapudi Road",
      phone: "+91 98480 00004",
      openTime: "11:30 AM",
      closeTime: "09:30 PM",
      openHours: "11:30 am - 9:30 pm",
      deliveryTime: "40-50 min",
      popularLandmark: "Close to Clock Tower",
      isFlagship: false
    },
    {
      id: "tenali",
      city: "Tenali",
      address: "Bose Road",
      phone: "+91 98480 00005",
      openTime: "11:30 AM",
      closeTime: "09:30 PM",
      openHours: "11:30 am - 9:30 pm",
      deliveryTime: "35-45 min",
      popularLandmark: "Near Gandhi Statue",
      isFlagship: false
    },
    {
      id: "hyderabad",
      city: "Hyderabad",
      address: "Road No. 36, Jubilee Hills",
      phone: "+91 98480 00006",
      openTime: "11:00 AM",
      closeTime: "11:00 PM",
      openHours: "11:00 am - 11:00 pm",
      deliveryTime: "40-55 min",
      popularLandmark: "Opposite Metro Pillar 1650",
      isFlagship: false
    }
  ],

  categories: [
    { id: "all", name: "All Dishes", icon: "utensils" },
    { id: "meals", name: "Meals", icon: "soup" },
    { id: "curries", name: "Curries", icon: "flame" },
    { id: "biryani", name: "Biryani", icon: "bowl" },
    { id: "tiffins", name: "Tiffins", icon: "sun" },
    { id: "sweets", name: "Sweets", icon: "cookie" }
  ],

  menuItems: [
    // Meals
    {
      id: "m1",
      name: "Andhra Veg Meals",
      category: "meals",
      type: "Veg",
      price: 180,
      description: "Rice, pappu, gongura pachadi, two curries, sambar, rasam, curd, ghee",
      tags: ["Signature", "Traditional", "Pure Ghee"],
      badge: "Bestseller"
    },
    {
      id: "m2",
      name: "Chicken Meals",
      category: "meals",
      type: "Non-veg",
      price: 240,
      description: "Full meals with Andhra chicken fry and spicy gravy",
      tags: ["Spicy", "Full Meal", "Special Fry"],
      badge: "Chef's Special"
    },
    // Curries
    {
      id: "c1",
      name: "Gongura Mutton",
      category: "curries",
      type: "Non-veg",
      price: 360,
      description: "Slow-cooked mutton with sour gongura leaves",
      tags: ["Authentic", "Sour & Fiery", "Slow Cooked"],
      badge: "House Specialty"
    },
    {
      id: "c2",
      name: "Gutti Vankaya Curry",
      category: "curries",
      type: "Veg",
      price: 150,
      description: "Stuffed brinjal in peanut and sesame masala",
      tags: ["Traditional", "Rich Gravy", "Nutty Flavours"],
      badge: "Customer Favourite"
    },
    {
      id: "c3",
      name: "Natu Kodi Pulusu",
      category: "curries",
      type: "Non-veg",
      price: 320,
      description: "Country chicken stewed in tamarind gravy",
      tags: ["Fiery", "Tamarind Tang", "Desi Country Chicken"],
      badge: "Fiery Hot"
    },
    // Biryani
    {
      id: "b1",
      name: "Chicken Dum Biryani",
      category: "biryani",
      type: "Non-veg",
      price: 260,
      description: "Basmati cooked on dum, served with raita",
      tags: ["Dum Cooked", "Aromatic", "With Mirchi Ka Salan & Raita"],
      badge: "Must Try"
    },
    {
      id: "b2",
      name: "Veg Pulao",
      category: "biryani",
      type: "Veg",
      price: 170,
      description: "Fragrant rice with vegetables and whole spices",
      tags: ["Fragrant", "Whole Spices", "Light & Flavoured"],
      badge: "Popular"
    },
    // Tiffins
    {
      id: "t1",
      name: "Pesarattu Upma",
      category: "tiffins",
      type: "Veg",
      price: 90,
      description: "Green gram dosa filled with upma, ginger chutney",
      tags: ["MLA Style", "Allum Chutney", "Crispy Green Gram"],
      badge: "Classic Andhra Tiffin"
    },
    {
      id: "t2",
      name: "Punugulu",
      category: "tiffins",
      type: "Veg",
      price: 80,
      description: "Crisp dosa-batter fritters with peanut chutney",
      tags: ["Street Style", "Hot & Crispy", "Peanut Podi & Chutney"],
      badge: "Evening Favourite"
    },
    // Sweets
    {
      id: "s1",
      name: "Bobbatlu",
      category: "sweets",
      type: "Veg",
      price: 70,
      description: "Sweet flatbread stuffed with chana dal and jaggery",
      tags: ["Poli / Bakshalu", "Desi Ghee", "Organic Jaggery"],
      badge: "Free on ₹500+"
    },
    {
      id: "s2",
      name: "Pootharekulu",
      category: "sweets",
      type: "Veg",
      price: 120,
      description: "Paper-thin rice sheets layered with ghee and sugar",
      tags: ["Atreyapuram Pride", "Paper Sweet", "Pure Ghee & Cardamom"],
      badge: "Heritage Sweet"
    }
  ],

  reviews: [
    {
      id: "r1",
      guest: "Ravi",
      city: "Vijayawada",
      dish: "Gongura Mutton",
      rating: 5,
      comment: "The gongura mutton is exactly like home. Spicy, sour and worth the wait.",
      verified: true,
      date: "Yesterday"
    },
    {
      id: "r2",
      guest: "Lakshmi",
      city: "Guntur",
      dish: "Andhra Veg Meals",
      rating: 5,
      comment: "We ordered meals for the whole family. Hot, on time and generous with ghee.",
      verified: true,
      date: "2 days ago"
    },
    {
      id: "r3",
      guest: "Srinivas",
      city: "Hyderabad",
      dish: "Pootharekulu & Biryani",
      rating: 4,
      comment: "Best pootharekulu outside Atreyapuram. The biryani is very good too.",
      verified: true,
      date: "3 days ago"
    }
  ],

  orderTrackingSteps: [
    {
      step: 1,
      title: "Order received",
      meaning: "The branch has your order",
      icon: "clipboard-check",
      durationSec: 15
    },
    {
      step: 2,
      title: "Cooking your food",
      meaning: "The kitchen is preparing it",
      icon: "flame",
      durationSec: 25
    },
    {
      step: 3,
      title: "Out for delivery",
      meaning: "A rider is on the way",
      icon: "bike",
      durationSec: 35
    },
    {
      step: 4,
      title: "Delivered",
      meaning: "Enjoy your meal",
      icon: "check-circle",
      durationSec: 0
    }
  ],

  offers: [
    {
      id: "free-sweet-500",
      title: "Free sweet on orders above Rs. 500",
      tagline: "A bobbatlu with every big order. Valid at all six branches.",
      minSpend: 500,
      rewardItem: "Bobbatlu",
      code: "SWEET500",
      active: true
    }
  ]
};
