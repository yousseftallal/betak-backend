const { sequelize, User, Video, Comment, Sound, Report } = require('./models');

async function seedReports() {
    try {
        console.log('🌱 Seeding Reports...');

        // 1. Get or Create a Reporter User
        let reporter = await User.findOne({ where: { username: 'report_tester' } });
        if (!reporter) {
            reporter = await User.create({
                username: 'report_tester',
                email: 'reporter@test.com',
                password_hash: 'hash',
                phone: '1234567890'
            });
        }

        // 2. Get or Create a Bad User (To be banned)
        let badUser = await User.findOne({ where: { username: 'bad_user_target' } });
        if (!badUser) {
            badUser = await User.create({
                username: 'bad_user_target',
                email: 'bad@test.com',
                password_hash: 'hash',
                phone: '0987654321',
                status: 'active'
            });
        }

        // --- SCENARIO 1: REPORT ON VIDEO ---
        // Create Video
        let video = await Video.create({
            user_id: badUser.id,
            title: 'Offensive Video Content',
            video_url: 'http://example.com/bad.mp4',
            thumbnail_url: 'http://example.com/thumb.jpg',
            status: 'active'
        });

        // Create Report
        await Report.create({
            reporter_user_id: reporter.id,
            target_id: video.id,
            reported_type: 'video', // 'video' | 'user' | 'comment' | 'sound' (if supported)
            reason: 'Hate Speech',
            description: 'This video contains hateful comments.',
            status: 'pending',
            priority: 'high'
        });
        console.log('✅ Created Report for Video');


        // --- SCENARIO 2: REPORT ON COMMENT ---
        // Create another video for context
        let safeVideo = await Video.create({
            user_id: reporter.id,
            title: 'Safe Video',
            video_url: 'http://example.com/good.mp4',
            status: 'active'
        });
        
        // Create Bad Comment
        let comment = await Comment.create({
            user_id: badUser.id,
            video_id: safeVideo.id,
            content: 'This is a harassment comment!'
        });

        // Create Report
        await Report.create({
            reporter_user_id: reporter.id,
            target_id: comment.id,
            reported_type: 'comment',
            reason: 'Harassment',
            description: 'User is harassing in comments.',
            status: 'pending',
            priority: 'medium'
        });
        console.log('✅ Created Report for Comment');


        // --- SCENARIO 3: REPORT ON SOUND ---
        // Create Bad Sound
        let sound = await Sound.create({
            uploaded_by: badUser.id,
            title: 'Copyrighted Song',
            artist: 'Famous Artist',
            duration: 60,
            file_url: 'http://example.com/song.mp3',
            is_flagged: false
        });

        // Create Report
        // Note: Check if Report model allows 'sound' in enum or string. If restricted, this might fail unless enum updated.
        // Assuming reported_type is STRING or includes sound.
        await Report.create({
            reporter_user_id: reporter.id,
            target_id: sound.id,
            reported_type: 'sound', // Ensure DB constraint allows this. If failure, we might need to update migration.
            reason: 'Copyright Infringement',
            description: 'This sound is copyrighted.',
            status: 'pending',
            priority: 'low'
        });
        console.log('✅ Created Report for Sound');


        console.log('🎉 Seeding Complete!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Seeding Failed:', error);
        process.exit(1);
    }
}

seedReports();
