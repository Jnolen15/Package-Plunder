class Spaceship extends Phaser.GameObjects.Sprite{
    constructor(scene, x, y, texture, frame, pointValue){
        super(scene, x, y, texture, frame);
        scene.add.existing(this);
        this.points = pointValue;
        this.moveSpeed = game.settings.spaceshipSpeed;
        this.goingLeft = true;
        this.hitWithBrick = false;
    }

    update(){
        // move spaceship
        if(this.goingLeft){
            this.x -= this.moveSpeed;
        } else {
            this.x += this.moveSpeed;
        }
        
        // wrap around
        if(this.x <= 0 - this.width * 2 || this.x >= game.config.width + this.width * 2){
            this.reset();
        }
    }

    //position reset
    reset(){
        var rand = Phaser.Math.Between(1, 2);
        if(rand == 1){
            this.x = game.config.width;
            this.goingLeft = true;
            this.flipX = false;
        } else {
            this.x = 0;
            this.goingLeft = false;
            this.flipX = true;
        }
    }
}