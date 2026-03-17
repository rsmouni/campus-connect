const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Opportunity = require('../models/Opportunity');

const opportunities = [
  {
    title: 'AI/ML Research Intern — Medical Imaging',
    organization: 'Stanford HAI (Human-Centered AI)',
    type: 'internship',
    description: 'Join our lab working on deep learning models for early cancer detection using radiology scans. You will build and evaluate CNNs and Vision Transformers on multi-modal medical datasets. The project bridges computer vision and clinical AI, aiming for real-world deployment in hospital systems.',
    requirements: 'Strong Python skills, experience with PyTorch or TensorFlow, understanding of CNNs. Prior exposure to medical data or healthcare domain a plus. Research mindset and ability to read papers independently.',
    skills: ['Python', 'PyTorch', 'TensorFlow', 'Computer Vision', 'Deep Learning', 'Medical Imaging', 'CNN'],
    location: 'Stanford, CA (Hybrid)',
    stipend: '$4,500/month',
    deadline: new Date(Date.now() + 45 * 86400000),
    link: 'https://hai.stanford.edu/careers',
    tags: ['AI', 'Healthcare', 'Research', 'Vision'],
  },
  {
    title: 'Software Engineering Intern — FinTech',
    organization: 'Stripe',
    type: 'internship',
    description: 'Build scalable payment infrastructure used by millions of businesses worldwide. Work with our Payments Core team on APIs, fraud detection pipelines, and real-time transaction systems. Interns ship production code on day one.',
    requirements: 'Proficiency in at least one backend language (Ruby, Go, Java, or Python). Understanding of REST APIs and distributed systems. CS fundamentals including data structures and algorithms.',
    skills: ['Python', 'Go', 'Java', 'REST APIs', 'Distributed Systems', 'SQL', 'Backend'],
    location: 'San Francisco, CA',
    stipend: '$8,000/month',
    deadline: new Date(Date.now() + 60 * 86400000),
    link: 'https://stripe.com/jobs',
    tags: ['FinTech', 'Backend', 'APIs', 'Payments'],
  },
  {
    title: 'Google Summer of Code — Open Source AI',
    organization: 'Google & TensorFlow Foundation',
    type: 'competition',
    description: 'Contribute to open-source machine learning projects under mentorship from Google engineers. Proposals accepted across TensorFlow, JAX, Keras, and related ecosystems. Work on real-world AI problems affecting millions of developers globally.',
    requirements: 'Must be an enrolled student. Proficiency in Python. Familiarity with ML frameworks. Strong communication skills for proposal writing. Prior open-source contributions a plus.',
    skills: ['Python', 'TensorFlow', 'JAX', 'Machine Learning', 'Open Source', 'Git'],
    location: 'Remote',
    stipend: '$3,000 – $6,600 (project-based)',
    deadline: new Date(Date.now() + 30 * 86400000),
    link: 'https://summerofcode.withgoogle.com',
    tags: ['Open Source', 'AI', 'Google', 'Competition'],
  },
  {
    title: 'Undergraduate Research Fellowship — NLP',
    organization: 'MIT CSAIL',
    type: 'research',
    description: 'Work alongside PhD students on large language model interpretability and robustness. Projects include probing transformer attention heads, adversarial prompting, and building evaluation benchmarks. Publish findings at top venues (ACL, EMNLP, NeurIPS).',
    requirements: 'Coursework in ML or NLP. Python programming. Familiarity with HuggingFace Transformers. Strong analytical thinking. Must commit to 12 weeks minimum.',
    skills: ['Python', 'NLP', 'Transformers', 'HuggingFace', 'Machine Learning', 'Research', 'LLMs'],
    location: 'Cambridge, MA',
    stipend: '$3,200/month + housing stipend',
    deadline: new Date(Date.now() + 50 * 86400000),
    link: 'https://www.csail.mit.edu/research',
    tags: ['NLP', 'LLMs', 'Research', 'MIT'],
  },
  {
    title: 'Regeneron Science Talent Search',
    organization: 'Society for Science',
    type: 'competition',
    description: 'The nation\'s most prestigious STEM competition for high school and undergraduate students. Submit original research in any STEM discipline. Top 40 finalists compete for $1.8M in prizes and recognition from Nobel laureates.',
    requirements: 'Original independent research project. Clear methodology and results. Written report and potential finalist interview. Open to students in US institutions.',
    skills: ['Research', 'Data Analysis', 'Scientific Writing', 'Statistics', 'Experimental Design'],
    location: 'Remote + Washington DC (finals)',
    stipend: 'Prize money up to $250,000',
    deadline: new Date(Date.now() + 90 * 86400000),
    link: 'https://www.societyforscience.org/regeneron-sts/',
    tags: ['STEM', 'Research', 'Competition', 'Science'],
  },
  {
    title: 'NSF Graduate Research Fellowship',
    organization: 'National Science Foundation',
    type: 'scholarship',
    description: 'The NSF GRFP provides 3 years of financial support for outstanding graduate students pursuing research-based master\'s and doctoral degrees in STEM fields. Fellows are recognized as emerging leaders in their fields.',
    requirements: 'US citizen or permanent resident. Currently in or applying to graduate school in STEM. Strong academic record. Research experience strongly recommended. Two reference letters required.',
    skills: ['Research', 'Scientific Writing', 'STEM', 'Data Analysis'],
    location: 'Nationwide (US)',
    stipend: '$37,000/year + $12,000 education allowance',
    deadline: new Date(Date.now() + 75 * 86400000),
    link: 'https://www.nsfgrfp.org',
    tags: ['Scholarship', 'Graduate', 'NSF', 'STEM', 'Funding'],
  },
  {
    title: 'Data Science Intern — Climate Analytics',
    organization: 'NOAA (National Oceanic and Atmospheric Administration)',
    type: 'internship',
    description: 'Analyze petabyte-scale climate datasets to develop predictive models for extreme weather events. Work with satellite imagery, ocean sensor data, and atmospheric models. Help build open-access dashboards for climate scientists worldwide.',
    requirements: 'Strong Python and data science skills (pandas, numpy, scikit-learn). Experience with geospatial data (GDAL, xarray) a strong plus. Interest in environmental science or climate change.',
    skills: ['Python', 'Data Science', 'Machine Learning', 'scikit-learn', 'Data Visualization', 'Statistics', 'pandas'],
    location: 'Silver Spring, MD (Hybrid)',
    stipend: '$3,800/month',
    deadline: new Date(Date.now() + 40 * 86400000),
    link: 'https://www.noaa.gov/opportunities',
    tags: ['Data Science', 'Climate', 'Environment', 'Government'],
  },
  {
    title: 'Cybersecurity Research Intern',
    organization: 'MITRE Corporation',
    type: 'internship',
    description: 'Contribute to cutting-edge research in cyber threat intelligence, vulnerability analysis, and AI-driven intrusion detection. Work on projects that directly inform US government cybersecurity policy and defense strategy.',
    requirements: 'Knowledge of networking fundamentals, OS security, and scripting (Python/Bash). Coursework in security, cryptography, or OS. US citizenship required for clearance. CTF experience welcome.',
    skills: ['Python', 'Cybersecurity', 'Networking', 'Linux', 'Cryptography', 'Threat Analysis'],
    location: 'McLean, VA',
    stipend: '$5,200/month',
    deadline: new Date(Date.now() + 55 * 86400000),
    link: 'https://www.mitre.org/careers',
    tags: ['Cybersecurity', 'Research', 'Defense', 'Security'],
  },
  {
    title: 'Full-Stack Engineering Intern — EdTech',
    organization: 'Duolingo',
    type: 'internship',
    description: 'Build features used by 500M+ learners worldwide. Work on React Native mobile apps, Node.js backend services, and A/B testing infrastructure. Interns own complete features and present to leadership at the end of each term.',
    requirements: 'Experience with React or React Native. Node.js or similar backend. RESTful API design. Passion for education and product thinking. SQL basics.',
    skills: ['React', 'React Native', 'Node.js', 'JavaScript', 'SQL', 'REST APIs', 'MongoDB'],
    location: 'Pittsburgh, PA (Hybrid)',
    stipend: '$7,200/month',
    deadline: new Date(Date.now() + 35 * 86400000),
    link: 'https://careers.duolingo.com',
    tags: ['EdTech', 'Full-Stack', 'Mobile', 'React'],
  },
  {
    title: 'Rhodes Scholarship',
    organization: 'Rhodes Trust',
    type: 'scholarship',
    description: 'One of the world\'s most prestigious postgraduate awards, funding 2-3 years of study at the University of Oxford. Scholars are selected for intellectual achievement, leadership, service to community, and character.',
    requirements: 'Exceptional academic record (typically 3.9+ GPA). Demonstrated leadership and community impact. Strong character references. US citizen aged 18-24. Interviews required.',
    skills: ['Research', 'Leadership', 'Academic Excellence', 'Community Service', 'Writing'],
    location: 'University of Oxford, UK',
    stipend: 'Full tuition + £18,180/year living stipend',
    deadline: new Date(Date.now() + 120 * 86400000),
    link: 'https://www.rhodeshouse.ox.ac.uk',
    tags: ['Scholarship', 'Oxford', 'Prestigious', 'Graduate'],
  },
  {
    title: 'MLH Fellowship — Open Source',
    organization: 'Major League Hacking',
    type: 'competition',
    description: 'A 12-week remote internship alternative where you contribute to open source projects used by engineers at top companies. Fellows work on real codebases in teams with mentors from Microsoft, Meta, GitHub, and more.',
    requirements: 'Enrolled student or recent grad. Experience with at least one programming language. Git proficiency. Collaborative spirit. No prior open-source experience required.',
    skills: ['Python', 'JavaScript', 'Git', 'Open Source', 'Collaboration', 'Problem Solving'],
    location: 'Remote',
    stipend: '$5,000 – $6,000 total',
    deadline: new Date(Date.now() + 25 * 86400000),
    link: 'https://fellowship.mlh.io',
    tags: ['Open Source', 'Hackathon', 'Community', 'MLH'],
  },
  {
    title: 'Robotics & Autonomy Research Intern',
    organization: 'Boston Dynamics AI Institute',
    type: 'research',
    description: 'Research next-generation motion planning, perception, and control algorithms for legged robots. Work on real hardware and simulation environments. Projects span reinforcement learning for locomotion, SLAM, and human-robot interaction.',
    requirements: 'Strong background in robotics, control theory, or RL. Python and C++ proficiency. Experience with ROS, Gazebo, or similar. Linear algebra and optimization fundamentals.',
    skills: ['Python', 'C++', 'Robotics', 'ROS', 'Reinforcement Learning', 'Computer Vision', 'Control Systems'],
    location: 'Cambridge, MA',
    stipend: '$5,500/month',
    deadline: new Date(Date.now() + 65 * 86400000),
    link: 'https://theaiinstitute.com/careers',
    tags: ['Robotics', 'AI', 'Research', 'Hardware'],
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Opportunity.deleteMany({});
    const inserted = await Opportunity.insertMany(opportunities);
    console.log(`✅ Seeded ${inserted.length} opportunities`);
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
