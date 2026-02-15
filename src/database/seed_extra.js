/**
 * Seed Extra Data: Conversations, Messages, Stories
 * Run AFTER seed_data.js: node src/database/seed_extra.js
 */
const { sequelize, User, Conversation, Message, Story, StoryView } = require('./models');

// Story images (free Pexels photos)
const STORY_IMAGES = [
    'https://images.pexels.com/photos/1054218/pexels-photo-1054218.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/3225517/pexels-photo-3225517.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/1181676/pexels-photo-1181676.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/2387793/pexels-photo-2387793.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/1142950/pexels-photo-1142950.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/2878019/pexels-photo-2878019.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/1486222/pexels-photo-1486222.jpeg?auto=compress&cs=tinysrgb&w=600',
];

const STORY_TEXTS = [
    'يوم جميل ☀️',
    'أكل شعبي 🍲',
    'تصوير اليوم 📸',
    null,
    'غروب رائع 🌅',
    null,
    'جولة في المدينة 🏙️',
    null,
    'طبيعة خلابة 🌿',
    null,
    'تمرين الصباح 💪',
    'مراجعة جديدة 📱',
];

// Arabic conversation messages
const CONVERSATION_DATA = [
    {
        p1_idx: 0, p2_idx: 1, // ahmed_ali <-> sara_mohammed
        messages: [
            { sender: 0, content: 'مرحبا سارة! شفت فيديو الطبخ الأخير، كان رهيب 🔥', mins_ago: 120 },
            { sender: 1, content: 'شكراً أحمد! الله يسلمك ❤️', mins_ago: 115 },
            { sender: 0, content: 'ممكن تعلمينا وصفة الكبة؟', mins_ago: 110 },
            { sender: 1, content: 'أكيد! بنزلها فيديو بكرة إن شاء الله', mins_ago: 105 },
            { sender: 0, content: 'تمام، منتظر 👍', mins_ago: 100 },
        ]
    },
    {
        p1_idx: 2, p2_idx: 3, // omar_tech <-> fatima_beauty
        messages: [
            { sender: 2, content: 'فاطمة، شو رأيك نعمل كولاب؟', mins_ago: 200 },
            { sender: 3, content: 'فكرة حلوة! شو الموضوع؟', mins_ago: 195 },
            { sender: 2, content: 'مراجعة أدوات الميك اب التقنية الجديدة', mins_ago: 190 },
            { sender: 3, content: 'حلو كثير! نتواصل عالخاص', mins_ago: 185 },
        ]
    },
    {
        p1_idx: 4, p2_idx: 0, // hassan_fitness <-> ahmed_ali
        messages: [
            { sender: 4, content: 'أحمد! شفت صورك الأخيرة، التصوير عالي جداً', mins_ago: 60 },
            { sender: 0, content: 'شكراً حسن 🙏 كيف التمارين؟', mins_ago: 55 },
            { sender: 4, content: 'الحمد لله، نزلت فيديو تمرين جديد اليوم', mins_ago: 50 },
            { sender: 0, content: 'شفته كان مفيد جداً 💪', mins_ago: 45 },
        ]
    },
    {
        p1_idx: 6, p2_idx: 8, // khalid_gaming <-> youssef_comedy
        messages: [
            { sender: 6, content: 'يا يوسف تعال نلعب مع بعض بث مباشر 🎮', mins_ago: 30 },
            { sender: 8, content: 'يلا! متى؟', mins_ago: 25 },
            { sender: 6, content: 'الليلة الساعة 9؟', mins_ago: 20 },
            { sender: 8, content: 'تمام موجود 👍', mins_ago: 15 },
            { sender: 6, content: 'جهز نفسك هتكون مباراة نارية 🔥', mins_ago: 10 },
            { sender: 8, content: 'أنا جاهز يا معلم 😂', mins_ago: 5 },
        ]
    },
    {
        p1_idx: 7, p2_idx: 5, // lina_travel <-> noor_art
        messages: [
            { sender: 7, content: 'نور! لوحتك الأخيرة كانت تحفة 🎨', mins_ago: 300 },
            { sender: 5, content: 'شكراً لينا! وين رحلتك الجاية؟', mins_ago: 290 },
            { sender: 7, content: 'إسطنبول الأسبوع الجاي ✈️', mins_ago: 285 },
            { sender: 5, content: 'واو! صوري لي البازار الكبير من فضلك', mins_ago: 280 },
        ]
    },
    {
        p1_idx: 9, p2_idx: 1, // rania_fashion <-> sara_mohammed
        messages: [
            { sender: 9, content: 'سارة حبيبتي! شو لابسة اليوم؟ 👗', mins_ago: 150 },
            { sender: 1, content: 'هههه اليوم كنت بالمطبخ يا رانيا 😂', mins_ago: 145 },
            { sender: 9, content: 'حتى بالمطبخ لازم تكوني ستايل!', mins_ago: 140 },
            { sender: 1, content: 'صح كلامك 💃', mins_ago: 135 },
        ]
    },
    {
        p1_idx: 10, p2_idx: 4, // ali_sports <-> hassan_fitness
        messages: [
            { sender: 10, content: 'حسن شفت مباراة البارحة؟ ⚽', mins_ago: 400 },
            { sender: 4, content: 'أكيد! كانت مباراة قوية', mins_ago: 395 },
            { sender: 10, content: 'الهدف الثالث كان خرافي 🔥', mins_ago: 390 },
        ]
    },
    {
        p1_idx: 11, p2_idx: 2, // dina_health <-> omar_tech
        messages: [
            { sender: 11, content: 'عمر، عندك فيديو عن أجهزة قياس الصحة؟', mins_ago: 500 },
            { sender: 2, content: 'أيوا! نزلت واحد الأسبوع الماضي', mins_ago: 495 },
            { sender: 11, content: 'ممتاز سأشاهده حالاً', mins_ago: 490 },
        ]
    },
    {
        p1_idx: 12, p2_idx: 6, // mustafa_cars <-> khalid_gaming
        messages: [
            { sender: 12, content: 'خالد شو رأيك بسيارة Tesla الجديدة؟ 🚗', mins_ago: 70 },
            { sender: 6, content: 'حلوة بس أنا أحب Porsche أكثر 😄', mins_ago: 65 },
            { sender: 12, content: 'ذوق عالي يا صاحبي!', mins_ago: 60 },
        ]
    },
    {
        p1_idx: 13, p2_idx: 14, // huda_education <-> zaid_music
        messages: [
            { sender: 13, content: 'زيد ممكن تعمل موسيقى لفيديو تعليمي؟ 🎵', mins_ago: 180 },
            { sender: 14, content: 'بكل سرور يا هدى! ابعثيلي التفاصيل', mins_ago: 175 },
            { sender: 13, content: 'الفيديو عن الفيزياء، 3 دقائق تقريباً', mins_ago: 170 },
            { sender: 14, content: 'تمام أعطيني يومين وبكون جاهز 🎶', mins_ago: 165 },
        ]
    },
    {
        p1_idx: 3, p2_idx: 9, // fatima_beauty <-> rania_fashion
        messages: [
            { sender: 3, content: 'رانيا! شفتي الباليت الجديد من MAC؟ 💄', mins_ago: 40 },
            { sender: 9, content: 'لا بعد! حلو؟', mins_ago: 35 },
            { sender: 3, content: 'روعة! بنزل فيديو مراجعة بكرة', mins_ago: 30 },
            { sender: 9, content: 'أنا بستنى! ابعثيلي واحد 😂❤️', mins_ago: 25 },
        ]
    },
    {
        p1_idx: 8, p2_idx: 0, // youssef_comedy <-> ahmed_ali
        messages: [
            { sender: 8, content: 'أحمد يا معلم! صورلي بورتريه 📸', mins_ago: 90 },
            { sender: 0, content: 'تعال على الاستوديو بكره الصبح 😄', mins_ago: 85 },
            { sender: 8, content: 'يلا يا كبير! بس لا تطلعني وسيم زيادة 😂', mins_ago: 80 },
        ]
    },
];

async function seedExtra() {
    try {
        console.log('🌱 Starting extra seed data...\n');

        // Get all demo users
        const users = await User.findAll({
            where: { status: 'active' },
            order: [['id', 'ASC']],
            limit: 15,
            attributes: ['id', 'username']
        });

        if (users.length < 15) {
            console.error('❌ Need at least 15 users. Run seed_data.js first!');
            process.exit(1);
        }

        console.log(`Found ${users.length} users\n`);

        // ─────────────────────────────────────────────
        // 1. Create Conversations & Messages
        // ─────────────────────────────────────────────
        const existingConvos = await Conversation.count();
        if (existingConvos > 0) {
            console.log(`ℹ️  Already have ${existingConvos} conversations, skipping`);
        } else {
            console.log('💬 Creating conversations & messages...');
            for (const conv of CONVERSATION_DATA) {
                const p1 = users[conv.p1_idx];
                const p2 = users[conv.p2_idx];
                const lastMsg = conv.messages[conv.messages.length - 1];

                const conversation = await Conversation.create({
                    participant1_id: p1.id,
                    participant2_id: p2.id,
                    last_message: lastMsg.content,
                    last_message_at: new Date(Date.now() - lastMsg.mins_ago * 60 * 1000),
                    is_active: true
                });

                for (const msg of conv.messages) {
                    const sender = users[msg.sender];
                    await Message.create({
                        conversation_id: conversation.id,
                        sender_id: sender.id,
                        content: msg.content,
                        type: 'text',
                        read_at: msg.mins_ago > 60 ? new Date() : null, // Read if older than 1h
                        created_at: new Date(Date.now() - msg.mins_ago * 60 * 1000)
                    });
                }

                console.log(`  ✅ ${p1.username} ↔ ${p2.username} (${conv.messages.length} messages)`);
            }
        }

        // ─────────────────────────────────────────────
        // 2. Create Stories (expires in 24h)
        // ─────────────────────────────────────────────
        const existingStories = await Story.count();
        if (existingStories > 0) {
            console.log(`\nℹ️  Already have ${existingStories} stories, skipping`);
        } else {
            console.log('\n📖 Creating stories...');
            const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FF7675', '#74B9FF'];

            // First 12 users get stories (some get 2)
            for (let i = 0; i < 12; i++) {
                const user = users[i];
                const hoursAgo = Math.floor(Math.random() * 20) + 1; // 1-20 hours ago

                const story = await Story.create({
                    user_id: user.id,
                    media_url: STORY_IMAGES[i % STORY_IMAGES.length],
                    media_type: 'image',
                    text_overlay: STORY_TEXTS[i % STORY_TEXTS.length],
                    background_color: COLORS[i % COLORS.length],
                    expires_at: new Date(Date.now() + (24 - hoursAgo) * 60 * 60 * 1000), // Remaining time
                    views_count: Math.floor(Math.random() * 500) + 10,
                    is_active: true,
                    created_at: new Date(Date.now() - hoursAgo * 60 * 60 * 1000)
                });
                console.log(`  📷 ${user.username} — "${STORY_TEXTS[i % STORY_TEXTS.length] || 'photo'}" (${hoursAgo}h ago)`);

                // Add some views from other users
                const viewers = users.filter((_, idx) => idx !== i).slice(0, Math.floor(Math.random() * 8) + 2);
                for (const viewer of viewers) {
                    try {
                        await StoryView.create({
                            story_id: story.id,
                            viewer_id: viewer.id,
                            viewed_at: new Date(Date.now() - Math.random() * hoursAgo * 60 * 60 * 1000)
                        });
                    } catch (e) { /* skip duplicates */ }
                }
            }

            // Give some users a second story
            for (let i = 0; i < 5; i++) {
                const user = users[i];
                const hoursAgo = Math.floor(Math.random() * 10) + 1;

                await Story.create({
                    user_id: user.id,
                    media_url: STORY_IMAGES[(i + 6) % STORY_IMAGES.length],
                    media_type: 'image',
                    text_overlay: null,
                    background_color: COLORS[(i + 3) % COLORS.length],
                    expires_at: new Date(Date.now() + (24 - hoursAgo) * 60 * 60 * 1000),
                    views_count: Math.floor(Math.random() * 300) + 5,
                    is_active: true,
                    created_at: new Date(Date.now() - hoursAgo * 60 * 60 * 1000)
                });
                console.log(`  📷 ${user.username} — 2nd story (${hoursAgo}h ago)`);
            }
        }

        // ─────────────────────────────────────────────
        // Summary
        // ─────────────────────────────────────────────
        const totalConvos = await Conversation.count();
        const totalMessages = await Message.count();
        const totalStories = await Story.count();
        const totalViews = await StoryView.count();

        console.log('\n══════════════════════════════════════');
        console.log('🎉 Extra seed complete!');
        console.log(`   💬 Conversations: ${totalConvos}`);
        console.log(`   ✉️  Messages: ${totalMessages}`);
        console.log(`   📖 Stories: ${totalStories}`);
        console.log(`   👁️  Story views: ${totalViews}`);
        console.log('══════════════════════════════════════\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seed Extra Error:', error);
        process.exit(1);
    }
}

seedExtra();
