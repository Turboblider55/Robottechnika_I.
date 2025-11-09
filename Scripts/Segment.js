

class Robot_Segment{
            
        constructor(CS,Length,Angle,Min_Angle,Max_Angle){
            this.CS = CS;
            this.Length = Length;
            this.Angle = Angle;
            this.Min_Angle = Min_Angle;
            this.Max_Angle = Max_Angle;
            this.PrevSegment = null;
            this.NextSegment = null;
            this.Text = null;
            this.Scale = 100;
        }

        SetScale(scale){
            this.Scale = scale;
        }
        SetText(Text){
            this.Text = Text;
        }
        GetOrigins= () =>{
            return [this.CS.origin_x,this.CS.origin_y];
        }
        GetGlobalOrigin = () => {
            if(this.PrevSegment != null)
                this.PrevSegment.GetGlobalOrigin();
            
            return this.GetOrigins();
        }
        GetSegmentEndPositionGlobal = () => {
            let End_Coord_X = this.Length * this.Scale * Math.cos(ConvertAngle(-(this.CS.angle + this.Angle)));
            let End_Coord_Y = this.Length * this.Scale * Math.sin(ConvertAngle(-(this.CS.angle + this.Angle)));
             
            if(this.PrevSegment == null){
                   return [this.CS.origin_x + End_Coord_X,this.CS.origin_y + End_Coord_Y];
            }

            let prevData = this.PrevSegment.GetSegmentEndPositionGlobal();
            return [prevData[0] + End_Coord_X, prevData[1] + End_Coord_Y];
        }
        SetPrevSegment(PrevSegment){
            this.PrevSegment = PrevSegment;
            let PrevEndPos = this.PrevSegment.GetSegmentEndPositionGlobal();
            this.CS = new Coordinate_System(PrevEndPos[0],PrevEndPos[1],this.PrevSegment.Angle + this.PrevSegment.CS.angle + 180);
        }
        SetNextSegment(NextSegment){
            this.NextSegment = NextSegment;
        }
        Draw(){
            ctx.beginPath();
            ctx.strokeStyle = "black";
            ctx.fillStyle = "black";
            ctx.moveTo(this.CS.origin_x,this.CS.origin_y);
            
            let EndCoords = this.GetSegmentEndPositionGlobal();

            ctx.lineTo(EndCoords[0],EndCoords[1]);
            
            ctx.fill();
            ctx.stroke();

            ctx.closePath();
        }
        RotateAroundOrigin = (Angle,clockwise) =>{
            if(clockwise)
                this.Angle -= Angle;
            else
                this.Angle += Angle;

            this.Angle %= 360;

            if(this.Angle > this.Max_Angle)
                this.Angle = this.Max_Angle;
            else if (this.Angle < this.Min_Angle)
                this.Angle = this.Min_Angle;

            this.UpdateSegments();
        }
        SetAngle = (Angle) =>{
            this.Angle = Angle;

            this.Angle %= 360;

            if(this.Angle > this.Max_Angle)
                this.Angle = this.Max_Angle;
            else if (this.Angle < this.Min_Angle)
                this.Angle = this.Min_Angle;

            this.UpdateSegments();
        }
        SetMaxAngle(){
            this.Angle = this.Max_Angle;
            this.UpdateSegments();
        }
        SetMinAngle(){
            this.Angle = this.Min_Angle;
            this.UpdateSegments();
        }
        UpdateSegments = () =>{
            if(this.NextSegment != null){
                let EndPos = this.GetSegmentEndPositionGlobal();
                this.NextSegment.CS.origin_x = EndPos[0];
                this.NextSegment.CS.origin_y = EndPos[1];

                if(this.PrevSegment != null)
                    this.NextSegment.CS.angle = this.Angle + this.CS.angle + 180;
                else
                    this.NextSegment.CS.angle = this.Angle +  180;

                this.NextSegment.UpdateSegments();
            }
        }
        DrawOwnArea(){
            if(this.NextSegment == null)
                DrawArc(this.CS.origin_x,this.CS.origin_y,this.Length * this.Scale,-(this.CS.angle + this.Max_Angle),-(this.CS.angle + this.Min_Angle),false,[5,5]);
            else{
                let EndPos = this.GetNextXSegmentPos();
                let DistX = this.CS.origin_x - EndPos[0];
                let DistY = this.CS.origin_y - EndPos[1];
                let Dist = Math.sqrt((DistX)**2 + (DistY)**2);
                let Angle = Math.atan2(-DistY, -DistX) / Math.PI * 180;
                //Calculating the angle here is horrible
                //This is where i left the project off, Drawing a segments own working area is working
                //DrawArc(this.CS.origin_x,this.CS.origin_y,this.Length * Scalar,-(this.CS.angle + this.Max_Angle),-(this.CS.angle + this.Min_Angle),false);
                let StartAngle = (Angle + (this.Angle - this.Min_Angle))
                let EndAngle = (Angle - this.Max_Angle + (this.Angle))
                
                //console.log(StartAngle,EndAngle,Angle);

                DrawArc(this.CS.origin_x,this.CS.origin_y,Dist,StartAngle,EndAngle,true,[5,5]);
            }
        }
        DrawAngle(Color){
            ctx.beginPath();
            ctx.strokeStyle = `hsl(${Color},100%,50%)`;
            let Origin = this.GetOrigins();
            ctx.arc(Origin[0],Origin[1],15,-ConvertAngle(this.CS.angle),-ConvertAngle(this.CS.angle + this.Angle),true);
            ctx.stroke();
            ctx.closePath();
        }
        GetNextXSegmentPos(depth){
            //If depth is given it will go till that
            if(depth != null){
                if(depth == 0){
                        return this.GetSegmentEndPositionGlobal();
                    }
                if(depth > 0 && this.NextSegment != null){
                    return this.NextSegment.GetNextXSegmentPos(depth - 1);
                }
                else return [0,0];
            }
            //If no depth is given it will go till the end segment
            else{
                if(this.NextSegment != null)
                    return this.NextSegment.GetNextXSegmentPos();
                else 
                    return this.GetSegmentEndPositionGlobal();
            }
        }

        DrawText(){
            let EndPos = this.GetSegmentEndPositionGlobal()
            let Origins = this.GetOrigins();

            // let Pt = new Point(EndPos[0],EndPos[1],10,'EndP');
            // Pt.Draw();

            //console.log(this.CS.origin_x,this.CS.origin_y, this.CS.angle);

            let SegCenterX = (EndPos[0] - Origins[0]) / 2;
            let SegCenterY = (EndPos[1] - Origins[1]) / 2;

            //console.log(SegCenterX,SegCenterY,Math.sqrt(SegCenterX**2 + SegCenterY**2));
            
            SegCenterX -= Math.cos(ConvertAngle(this.CS.angle + this.Angle)) * 10 - 5;
            SegCenterY -= Math.sin(ConvertAngle(this.CS.angle + this.Angle)) * 10 + 5;

            ctx.beginPath();
            ctx.fillStyle  = "black";
            ctx.Font = "20px Arial";
            let HalfTextWidth = ctx.measureText(this.Text).width / 2;
            ctx.fillText(this.Text,Origins[0] + SegCenterX ,Origins[1] + SegCenterY);
            ctx.closePath();
        }
        

    }