class Point{
    constructor(posx,posy,rad,string){
        this.posx = posx;
        this.posy = posy;
        this.rad = rad;
        this.string = string;
    }

    Draw(Color){
        ctx.beginPath();
        ctx.setLineDash([]);
        ctx.strokeStyle = `hsl(${Color},100%,50%)`;
        ctx.fillStyle = `hsla(${Color},100%,50%,0.5)`;
        ctx.arc(this.posx,this.posy,this.rad,0,Math.PI * 2);
        
        ctx.fill();
        ctx.stroke();
        
        ctx.closePath();


        ctx.beginPath();
        ctx.fillStyle = ""
        let LetterSize = Math.floor(this.rad * 1.5);
        
        if(LetterSize < 1)
            LetterSize = 1;
        else if(LetterSize > 80)
            LetterSize = 80;

        ctx.font = `${LetterSize}px Arial`;
        ctx.fillText(this.string,this.posx - this.rad * 0.45,this.posy + this.rad * 0.45);
        
        ctx.closePath();
    }
}