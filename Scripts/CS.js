class Coordinate_System{
        constructor(origin_x,origin_y,angle){
            this.origin_x = origin_x;
            this.origin_y = origin_y;
            this.angle = angle;
        }

        DrawCS(){
            ctx.beginPath();
            ctx.strokeStyle = "red";
            ctx.moveTo(this.origin_x,this.origin_y);
            ctx.lineTo(this.origin_x + Math.cos(ConvertAngle(-this.angle)) * 50,this.origin_y + Math.sin(ConvertAngle(-this.angle)) * 50);
            ctx.stroke();
            ctx.closePath();

            ctx.beginPath();
            ctx.strokeStyle = "green";
            ctx.moveTo(this.origin_x,this.origin_y);
            ctx.lineTo(this.origin_x + Math.sin(ConvertAngle(-this.angle)) * 50,this.origin_y - Math.cos(ConvertAngle(-this.angle)) * 50);
            ctx.stroke();
            ctx.closePath();
        }

        DrawCSWithDivision(numberOfDiv){
            ctx.beginPath();
            ctx.strokeStyle = "red";
            ctx.moveTo(this.origin_x,this.origin_y);
            let ToX = 0;
            let ToY = 0;

            //X axis
            for(let i = 0;i < numberOfDiv; i++){
                ToX += Math.cos(ConvertAngle(-this.angle)) * 100;
                ToY += Math.sin(ConvertAngle(-this.angle)) *  100;
                ctx.lineTo(this.origin_x + ToX,this.origin_y +  ToY);

                let DivFromCoords = this.#GetDivCoords(90);

                ctx.moveTo(this.origin_x + ToX + DivFromCoords[0],this.origin_y +  ToY + DivFromCoords[1]);
                
                let DivToCoords = this.#GetDivCoords(-90);

                ctx.lineTo(this.origin_x + ToX + DivToCoords[0], this.origin_y +  ToY + DivToCoords[1]);
                
                let TextX = this.origin_x + ToX + (DivFromCoords[0] - DivToCoords[0]) / 10 * 20 - 5;
                let TextY = this.origin_y + ToY + (DivFromCoords[1] - DivToCoords[1]) / 10 * 20 + 5;
                
                this.#DrawText(`${i + 1}`,TextX,TextY,"20px Arial");

                ctx.moveTo(this.origin_x + ToX,this.origin_y +  ToY);


            }

            ctx.stroke();
            ctx.closePath();



            ctx.beginPath();
            ctx.strokeStyle = "green";
            ctx.moveTo(this.origin_x,this.origin_y);
            ToX = 0;
            ToY = 0;

            //Y Axis
            for(let i = 0;i < numberOfDiv; i++){
                ToX += Math.sin(ConvertAngle(-this.angle)) * 100;
                ToY += Math.cos(ConvertAngle(-this.angle)) * 100;
                ctx.lineTo(this.origin_x + ToX,this.origin_y -  ToY);

                let DivFromCoords = this.#GetDivCoords(90);

                ctx.moveTo(this.origin_x + ToX + DivFromCoords[1],this.origin_y -  ToY - DivFromCoords[0]);
                
                let DivToCoords = this.#GetDivCoords(-90);

                ctx.lineTo(this.origin_x + ToX + DivToCoords[1], this.origin_y -  ToY - DivToCoords[0]);
            

                let TextX = this.origin_x + ToX + (DivToCoords[1] - DivFromCoords[1]) / 10 * 20 - 5;
                let TextY = this.origin_y - ToY - (DivToCoords[0] - DivFromCoords[0]) / 10 * 20 + 5;
                
                this.#DrawText(`${i + 1}`,TextX,TextY,"20px Arial");
                
                ctx.moveTo(this.origin_x + ToX,this.origin_y -  ToY);

            }

            ctx.stroke();
            ctx.closePath();

        }

        #GetDivCoords(angle){
            return [
                Math.cos(ConvertAngle(-this.angle + angle)) * 5,
                Math.sin(ConvertAngle(-this.angle + angle)) * 5
            ]
        }

        #DrawText(text,posx,posy,Font){
            ctx.font = Font;
            ctx.fillText(text,posx,posy);
        }

    } 