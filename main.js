const Discord = require("discord.js");
const Jimp = require('jimp');
const bot = new Discord.Client();
const token = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
const faceapi = require('face-api.js')
const canvas = require('canvas');
const { Canvas, Image, ImageData } = canvas
count = 0;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData })

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromDisk('./models'),
    faceapi.nets.faceLandmark68Net.loadFromDisk('./models')
]).then(bot.login(token));


bot.on('ready', () => {
    console.log('ready');
})

bot.on("message", msg => {
    if (msg.author.id != bot.user.id) {
        for (i = 0; i < msg.attachments.size; i++) {
            Jimp.read(msg.attachments.first().url).then(img => {
                name = 'hi.jpg';
                if(img.getWidth() > 1080){
                    console.log('hi')
                    img.resize(img.getWidth()*.5, img.getHeight()*.5);
                }
                img.write(name, function () {
                    canvas.loadImage(name).then(cimg => {
                        faceapi.detectAllFaces(cimg, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().then(detections => {
                            detections.forEach(function (detection) {
                                Jimp.read('\obamas/obama' + Math.floor(Math.random() * 5) + '.png').then(obama => {
                                    count++;
                                    obama.resize(detection.detection.box.width * 1.15, detection.detection.box.height * 1.3);
                                    x = detection.landmarks.getLeftEye()[0].x - detection.landmarks.getRightEye()[0].x
                                    y = detection.landmarks.getLeftEye()[0].y - detection.landmarks.getRightEye()[0].y
                                    theta = Math.atan2(x, y);
                                    obama.rotate((theta * 180) / Math.PI + 90);
                                    img.composite(obama,
                                        detection.landmarks.getNose()[0].x - obama.getWidth() / 2,
                                        detection.landmarks.getNose()[0].y - obama.getHeight() / 2);
                                    name = "bye.jpg";
                                    if (detections.length <= count) {
                                        img.write(name, function () {
                                            msg.channel.send({
                                                files: ["bye.jpg"]
                                            })
                                            count = 0;
                                            //msg.delete();
                                        });
                                    }
                                })
                            })
                        })
                    })
                });
            })
        }
    }
})
