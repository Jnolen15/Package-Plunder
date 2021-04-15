console.log("Play.js");

class Play extends Phaser.Scene {
    constructor() {
        super("playScene");
    }

    preload(){
        this.load.image('sky', './assets/Sky.png');
        this.load.image('clouds', './assets/clouds.png');
        this.load.image('rock', './assets/rock.png');
        this.load.image('brick', './assets/brick.png');
        this.load.image('slingshot', './assets/slingshot.png');
        this.load.image('drone', './assets/drone.png');
        //load spritesheet
        this.load.spritesheet('explosion', './assets/explosion.png', {frameWidth: 64, frameHeight: 32, startFrame: 0, endFrame: 9});
        }

    create() {
        // sky bacground
        this.sky = this.add.tileSprite(0,0,640,480, 'sky').setOrigin(0,0);
        this.clouds = this.add.tileSprite(0,0,640,480, 'clouds').setOrigin(0,0);
        
        // White borders
        this.add.rectangle(0, 0, game.config.width, borderUISize, 0xFFFFFF).setOrigin(0 ,0);
        this.add.rectangle(0, game.config.height - borderUISize, game.config.width, borderUISize, 0xFFFFFF).setOrigin(0 ,0);
        this.add.rectangle(0, 0, borderUISize, game.config.height, 0xFFFFFF).setOrigin(0 ,0);
        this.add.rectangle(game.config.width - borderUISize, 0, borderUISize, game.config.height, 0xFFFFFF).setOrigin(0 ,0);

        // Add slingshot
        this.slingshot = this.add.sprite(66,50, 'slingshot').setOrigin(0,0);

        // Add rocket
        this.p1Rocket = new Rocket(this, game.config.width / 2, game.config.height - borderUISize - borderPadding, 'rock').setOrigin(0.5,0);
        
        // Add Drones (x3)
        this.ship01 = new Spaceship(this, game.config.width + borderUISize*6, borderUISize*4, 'drone', 0, 30).setOrigin(0, 0);
        this.ship02 = new Spaceship(this, game.config.width + borderUISize*3, borderUISize*5 + borderPadding*2, 'drone', 0, 20).setOrigin(0,0);
        this.ship03 = new Spaceship(this, game.config.width, borderUISize*6 + borderPadding*4, 'drone', 0, 10).setOrigin(0,0);

        // define keys
        keyF = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
        keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        keyLEFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        keyRIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);

        // animation config
        this.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 9, first: 0}),
            frameRate: 30
        });

        // Initialize score
        this.p1Score = 0;

        // display score
        let scoreConfig = {
            fontFamily: 'Courier',
            fontSize: '28px',
            backgroundColor: '#5b6ee1',
            color: '#843605',
            align: 'right',
            padding: {
                top: 5,
                bottom: 5,
            },
            fixedWidth: 100
        }
        this.scoreLeft = this.add.text(borderUISize + borderPadding, borderUISize + borderPadding*2,this.p1Score + "$", scoreConfig);

        // GAME OVER flag
        this.gameOver = false;
        
        // 60-second play clock
        scoreConfig.fixedWidth = 0;
        this.clock = this.time.delayedCall(game.settings.gameTimer, () => {
            this.add.text(game.config.width / 2, game.config.height / 2, 'GAME OVER', scoreConfig).setOrigin(0.5);
            this.add.text(game.config.width / 2, game.config.height / 2 + 64, 'Press (R) to Restart or <- for menu', scoreConfig).setOrigin(0.5);
            this.gameOver = true;
        }, null, this);
    }

    update(){
        // check key input for restart
        if (this.gameOver && Phaser.Input.Keyboard.JustDown(keyR)){
            this.scene.restart();
        }
        if (this.gameOver && Phaser.Input.Keyboard.JustDown(keyLEFT)){
            this.scene.start("menuScene");
        }
        
        // check if points are high enough for brick mode.
        if(this.p1Score > 190){
            this.p1Rocket.setTexture('brick');
            this.p1Rocket.brickMode = true;
        }


        this.clouds.tilePositionX -= 1;

        // Move the slingshot with the 'rocket' except when its firing
        if(!this.p1Rocket.isFiring){
            this.slingshot.setPosition(this.p1Rocket.x - 40, this.p1Rocket.y - 40);
        }

        if(!this.gameOver){
            this.p1Rocket.update();
            // update drones
            this.ship01.update();
            this.ship02.update();
            this.ship03.update();
        }

        // check collisions
        if(this.checkCollision(this.p1Rocket, this.ship03)){
            this.shipExplode(this.ship03);
            console.log("Bottem of check");
            if(!this.p1Rocket.brickMode == true){
                this.p1Rocket.reset();
            } else {
                this.ship03.hitWithBrick = true;
            }
        }
        if(this.checkCollision(this.p1Rocket, this.ship02)){
            this.shipExplode(this.ship02);
            console.log("Bottem of check");
            if(!this.p1Rocket.brickMode == true){
                this.p1Rocket.reset();
            } else {
                this.ship02.hitWithBrick = true;
            }
        }
        if(this.checkCollision(this.p1Rocket, this.ship01)){
            this.shipExplode(this.ship01);
            console.log("Bottem of check");
            if(!this.p1Rocket.brickMode == true){
                this.p1Rocket.reset();
            } else {
                this.ship01.hitWithBrick = true;
            }
        }
    }

    checkCollision(rocket, ship){
        // simple AABB checking
        if(rocket.x < ship.x + ship.width &&
            rocket.x + rocket.width > ship.x &&
            rocket.y < ship.y + ship.height &&
            rocket.height + rocket.y > ship.y &&
            ship.hitWithBrick == false) {
                return true;
        } else {
            return false;
        }
    }

    shipExplode(ship) {
        // temporarily hide ship
        ship.alpha = 0;
        // create explosion sprite at ships location
        let boom = this.add.sprite(ship.x, ship.y, 'explosion').setOrigin(0, 0);
        boom.anims.play('explode');
        boom.on('animationcomplete', () => {
            ship.reset();
            ship.alpha = 1;
            boom.destroy();
            ship.hitWithBrick = false;
        });
        // score add and repaint
        this.p1Score += ship.points;
        this.scoreLeft.text = this.p1Score + "$";
        // sound FX
        this.sound.play('sfx_explosion');
    }
    
}