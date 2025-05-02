(()=>{

    class Player{

        score = 0;
       
        constructor(x,y,height,id){
            this.pos = {x,y};
            this.width = 20;
            this.height = height;
            this.id = id;
        }

        increaseScore = ()=> ++this.score

        move = (y)=> this.pos.y = y;
        
    }

    function Ball(){
        this.radius= 10;
        this.minVelocity = 6;
        this.maxVelocity = 14;
        this.initialServer = true;
        this.directions = {x: 0, y: 0};
        this.pos = {x: this.radius, y: this.radius};
      

        Ball.prototype.changeAngle = function(dirX = 1, dirY = Math.random() > 0.5 ? 1 : -1) {
            const speed = Math.random() * (this.maxVelocity - this.minVelocity) + this.minVelocity;
        
            const angle = (Math.random() * Math.PI / 3) - (Math.PI / 6); 
            
            this.directions.x = dirX * speed * Math.cos(angle);
            this.directions.y = dirY * speed * Math.sin(angle);
        };

        Ball.prototype.newServe = function(server){
            const middleY = canvas.height / 2;
            const middleX = canvas.width / 2;

            this.pos.x = middleX;
            this.pos.y = middleY;

            this.directions.x = 0;
            this.directions.y = 0;

            this.changeAngle(server,0)
        }

        Ball.prototype.checkCollision = function(){
           
           
            if(this.pos.y + this.radius >= height){
                this.directions.y += -1;
                this.initialServer = false;  
            }

            if(this.pos.y - this.radius <= 0){
                this.directions.y += 1;
                this.initialServer = false;
            }

            if (this.pos.x + this.radius >= computer.pos.x - computer.width && this.pos.y + this.radius >= computer.pos.y && this.pos.y - this.radius <= computer.pos.y + computer.height) {
                this.changeAngle(-1);
                this.initialServer = false;
            }
            else if(this.pos.x > computer.pos.x){
                this.initialServer = false;
                player.increaseScore();
                createFeedBackMessage('Point for Player!')
                this.newServe(-1);
               
            }

            if (this.pos.x - this.radius <= player.pos.x + player.width && this.pos.y + this.radius >= player.pos.y && this.pos.y - this.radius <= player.pos.y + player.height) {
                this.changeAngle(1);
                this.initialServer = false;
            }
            else if(this.pos.x < player.pos.x && !this.initialServer){
                computer.increaseScore();
                createFeedBackMessage('Point for Computer!')
                this.newServe(1);
            }
           
        }
        
        Ball.prototype.move = function(){

            this.checkCollision();
            this.pos.x += this.directions.x;
            this.pos.y += this.directions.y;
        }
        
    }

    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const width = document.documentElement.clientWidth * .9;
    const height = (width > 768) ? document.documentElement.clientHeight * .8 : document.documentElement.clientHeight * .5;
    const heightPlayer = Math.floor(height * .2);
    const posPlayerX = 10;
    const scoreX = width / 5;
    let gameOver = false;
    const MAX_SCORE = 5;

    canvas.width = width;
    canvas.height = height;
    const player = new Player(posPlayerX, Math.floor(height / 2) - heightPlayer / 2, heightPlayer, 'player');
    const computer = new Player(width - posPlayerX, Math.floor(height / 2) - heightPlayer / 2, heightPlayer, 'computer');
    const ball = new Ball();



    const drawPaddle = (p)=>{
        ctx.fillStyle = '#E1E1E1';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;

        ctx.fillRect(p.id === 'computer'? p.pos.x - p.width : p.pos.x, p.pos.y, p.width, p.height);
        ctx.strokeRect(p.id === 'computer'? p.pos.x - p.width : p.pos.x, p.pos.y, p.width, p.height);
    }

    const drawSeparatorLine = ()=>{
        const widthLine = 5;
        const maxLines = 10;
        const heightLine = Math.floor(height / maxLines) / 2;
        const posX = width / 2;
        const offset = heightLine / 2;
        
        ctx.fillStyle = '#BBB';

        for(let i = 0; i < maxLines; i++){
            ctx.fillRect(posX, (heightLine * i * 2) + offset, widthLine,heightLine);
        }
    }

    const drawScore = ()=>{
        ctx.font = '150px monospace';
        ctx.fillStyle = '#CCC';
        ctx.textAlign = 'left'
        ctx.fillText(player.score, scoreX, 150, 100);

        ctx.textAlign = 'right';
        ctx.fillText(computer.score, width - scoreX, 150, 100);
    }

    const drawBall = ()=>{
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(ball.pos.x, ball.pos.y, ball.radius, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fill();
    }

    const moveComputer = ()=>{
        if(ball.pos.x > canvas.width * .2){
            computer.pos.y = ball.pos.y - ball.radius;
        }
       
        if (computer.pos.y < 0) computer.pos.y = 0;
        if (computer.pos.y + computer.height > height) computer.pos.y = height - computer.height;
    }

    const update = ()=>{
        ctx.clearRect(0,0,canvas.width,canvas.height);
        drawPaddle(player);
        drawPaddle(computer);
        drawSeparatorLine();
        drawScore();
        drawBall();
        moveComputer();
        ball.move();
    }

    const render = ()=>{
        update();
        if(!gameOver) requestAnimationFrame(render);
        if(player.score === MAX_SCORE || computer.score === MAX_SCORE){
            gameOver = true;   
        }
        player.score === MAX_SCORE && createFeedBackMessage('Players Wins!');
        computer.score === MAX_SCORE && createFeedBackMessage('Computer Wins!');
    }
    
    const movePLayer = (e)=>{
        if(e.clientY > height - heightPlayer || e.clientY < 0)return;
        player.pos.y = e.clientY;
    }

    const resetGame = (container)=>{
        player.score = 0;
        computer.score = 0;
        player.pos.y = Math.floor(height / 2) - heightPlayer / 2;
        computer.pos.y = Math.floor(height / 2) - heightPlayer / 2;
        ball.initialServer = true;
        ball.directions = {x: 0, y :0};
        ball.pos = {x : ball.radius, y : ball.radius};
        gameOver = false;
        ball.changeAngle();
        render();
        container.remove();
    }

    const createFeedBackMessage = (msg)=>{
        const hasMessage = document.body.querySelector('.feedback');
        hasMessage && hasMessage.remove();
        const container = document.createElement('DIV');
        container.classList.add('feedback','appear');
        const message = document.createElement('P');
        message.textContent = msg;
        container.append(message);

        if(gameOver){
            const buttonResetGame = document.createElement('BUTTON');
            buttonResetGame.textContent = 'New Game';
            container.append(buttonResetGame);
            buttonResetGame.onclick = ()=> resetGame(container);
        }

        document.body.appendChild(container);
    }
 
    ball.changeAngle();
    render();
    window.addEventListener('mousemove',movePLayer);
    
  


})();