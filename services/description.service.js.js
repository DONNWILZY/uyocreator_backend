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
    return gender === 'male' ? 'male-avatar.jpg' : 'female-avatar.jpg';
  }
}

module.exports = DescriptionService;