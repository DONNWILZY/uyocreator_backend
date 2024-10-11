class DescriptionService {
  generateDescription(gender) {
    const descriptions = {
      male: [
        'Tech enthusiast',
        'Innovative thinker',
        'Creative problem solver',
        'Passionate developer',
        'Ambitious entrepreneur',
      ],
      female: [
        'Empowered woman in tech',
        'Inspirational leader',
        'Creative visionary',
        'Tech savvy innovator',
        'Dedicated developer',
      ],
    };

    return descriptions[gender][Math.floor(Math.random() * descriptions[gender].length)];
  }

  generateAvatar(gender) {
    return gender === 'male' ? 'https://res.cloudinary.com/dwbthqy0f/image/upload/v1728647979/female_ab2wvq.jpg' : 'https://res.cloudinary.com/dwbthqy0f/image/upload/v1728647979/male_jxqv1g.jpg';
  }
}

module.exports = DescriptionService;