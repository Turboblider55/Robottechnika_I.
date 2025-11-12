class Robot_Arm{
        constructor(CS){
            this.CS = CS;
            this.Segments = new Array();
            this.Points = new Array();
            this.EndPoints = new Array();
            this.tgy = 0;
            this.Maxvel = 0;
        }
        SaveSegmentsAngles(Level,arr){
            if(Level == null)
                Level = 0;

                let SegmentsAngles = [];
                if(arr != null)
                    SegmentsAngles = arr;

                    SegmentsAngles.push(this.Segments[Level].Angle);
                if(this.Segments[Level].NextSegment != null)
                    SegmentsAngles = this.SaveSegmentsAngles(Level + 1,SegmentsAngles);
                return SegmentsAngles;
             
        }
        LoadSegmentsAngles(Level,MinLevel,arr){
            
            if(Level == null && MinLevel == null && arr == null)
                return;

            this.Segments[Level].Angle = arr[Level-MinLevel];
            this.Segments[Level].UpdateSegments();
            //console.log("Segment Angle Loaded");
            if(this.Segments[Level].NextSegment != null && Level < this.Segments.length){
                this.LoadSegmentsAngles(Level + 1,MinLevel, arr);
            }
        }
        DrawSmallCS(){
            this.Segments.forEach(Segment=>{
                Segment.CS.DrawCS();
            })
        }
        DrawBigCS(){
            for(let i = 1; i < this.Segments.length;i++){
                this.Segments[i].CS.DrawCSWithDivision( Math.ceil(this.Segments[i].Length));
            }
        }
        DrawRobotCS(){
            let SegLenTotal = 0;
            this.Segments.forEach(Segment=>{
                SegLenTotal += Segment.Length;
            });
            this.CS.DrawCSWithDivision(Math.ceil(SegLenTotal));
        }
        DrawRobotArms(){
            this.Segments.forEach(Segment=>{
                Segment.Draw();
            });
        }
        DrawArmText(){
            this.Segments.forEach(Segment=>{
                Segment.DrawText();
            });
        }
        DrawArmAngles(){
            for(let i = 0; i < this.Segments.length ;i ++){
                this.Segments[i].DrawAngle(i * (320 / this.Segments.length));
            }
        }
        DrawWorkingArea(Level,MinLevel,state){
            let SegmentsAngles = [];
            if(MinLevel == null){
                MinLevel = Level;
            }
            if(state == null)
                state = 0;

            if(Level == MinLevel){
                SegmentsAngles = this.SaveSegmentsAngles(Level);
                
            }
            if(Level >= 0 && Level < this.Segments.length){
                //This is where i left off, Drawing the total working area is not working
                //Beacause not all combination of angles are drawn
                //I knew the answer a long time ago
                //I just didn't watn to accept it as a solution
                //Bad thinking
                if(this.Segments[Level].NextSegment != null){
                    for(let i = 0; i < 2 ; i++){
                        if((Level + i + state) % 2 == 0)
                            this.Segments[Level].SetMaxAngle();
                            //this.Segments[Level].RotateAroundOrigin(this.Segments[Level].Max_Angle - this.Segments[Level].Min_Angle);
                        else
                            this.Segments[Level].SetMinAngle();
                            //this.Segments[Level].RotateAroundOrigin(this.Segments[Level].Max_Angle - this.Segments[Level].Min_Angle,true);
                        
                        this.DrawWorkingArea(Level + 1,MinLevel,i); 
                        
                        this.Segments[Level].DrawOwnArea(); 
    
                    }
                }
                else{
                    if((Level + state) % 2 == 0)
                        this.Segments[Level].SetMaxAngle();
                    else
                        this.Segments[Level].SetMinAngle();

                    this.Segments[Level].DrawOwnArea(); 
                }
                
            }
            if(Level == MinLevel){
                this.LoadSegmentsAngles(Level, MinLevel, SegmentsAngles);
                //console.log("Segment Angles Loaded")
            }
                
        }
        #GetWorkingAreaEndCoords(Level,MinLevel,state){
            let SegmentsAngles = [];
            let AreaEndCoords = [];
            if(MinLevel == null){
                MinLevel = Level;
            }
            if(state == null)
                state = 0;

            if(Level == MinLevel){
                SegmentsAngles = this.SaveSegmentsAngles(Level);
                
            }
            if(Level >= 0 && Level < this.Segments.length){ 
                for(let i = 0; i < 2 ; i++){
                    if((Level + i + state) % 2 == 0)
                        this.Segments[Level].SetMaxAngle();
                    else
                        this.Segments[Level].SetMinAngle();

                    if(this.Segments[Level].NextSegment != null){
                        AreaEndCoords = AreaEndCoords.concat(this.#GetWorkingAreaEndCoords(Level + 1,MinLevel,i)); 
                    }
                    else{
                        AreaEndCoords.push(this.Segments[Level].GetSegmentEndPositionGlobal());
                    }
                }

                if(Level != MinLevel)
                    return AreaEndCoords;
            }
            if(Level == MinLevel){
                this.LoadSegmentsAngles(Level, MinLevel, SegmentsAngles);
                
            }
            return AreaEndCoords;
        }
        DrawAreaEnds(){
            let arr = this.#GetWorkingAreaEndCoords(0); 
            this.EndPoints = new Array();
            //console.log(arr);
            for(let i = 0; i < arr.length; i++){
                let Pt = new Point(arr[i][0],arr[i][1],10,String.fromCharCode(i + 65))
                Pt.Draw((320 / arr.length) * (i));
                this.EndPoints.push(Pt);
            }
        }
        SetPointsToMoveBetween(posx,posy){
            let res = this.CheckIfPointIsInSideWorkingArea(0,null,null,0,0,posx,posy);
            //console.log(res);
            if(res % 2 == 1){
                this.Points.push(new Point(posx,posy,5,'X'));
            }
        }
        DrawPointsToMoveBetween(){
            for(let i = 0; i < this.Points.length - 1; i++){
                ctx.beginPath();
                ctx.strokeStyle = "black";
                ctx.setLineDash([10,10]);
                ctx.moveTo(this.Points[i].posx,this.Points[i].posy);
                ctx.lineTo(this.Points[i + 1].posx,this.Points[i + 1].posy);
                ctx.stroke();
                ctx.setLineDash([]);
                ctx.closePath();
    
                this.Points[i].Draw();
            }
            if(this.Points.length > 0)
                this.Points[this.Points.length - 1].Draw();  
        }
        CheckIfPointIsInSideWorkingArea(Level,MinLevel,state,StartPosX,StartPosY,EndPosX,EndPosY){
            let Intersections = 0;
            let SegmentsAngles = [];
            if(MinLevel == null){
                MinLevel = Level;
            }
            if(state == null)
                state = 0;

            if(Level == MinLevel){
                SegmentsAngles = this.SaveSegmentsAngles(Level);
                
            }
            if(Level >= 0 && Level < this.Segments.length){
                if(this.Segments[Level].NextSegment != null){
                    for(let i = 0; i < 2 ; i++){
                        if((Level + i + state) % 2 == 0)
                            this.Segments[Level].SetMaxAngle();
                        else
                            this.Segments[Level].SetMinAngle();
                            
                        
                        Intersections += this.CheckIfPointIsInSideWorkingArea(Level + 1,MinLevel,i,StartPosX,StartPosY,EndPosX,EndPosY); 
                        
                        //Start from the left upper corner
                        let SegEndPos = this.Segments[Level].GetNextXSegmentPos();
                        let Origin = this.Segments[Level].GetOrigins();
                        let diffX = SegEndPos[0] - Origin[0];
                        let diffY = SegEndPos[1] - Origin[1];
                        let Rad = Math.sqrt(diffX**2 + diffY**2);
                        let Angle = Math.atan2(diffY, diffX) / Math.PI * 180;
                        
                        let StartAngle = (Angle + (this.Segments[Level].Angle - this.Segments[Level].Min_Angle));
                        let EndAngle = (Angle - this.Segments[Level].Max_Angle + this.Segments[Level].Angle);
    
                        //console.log(StartAngle,EndAngle);

                        //console.log(SegEndPos,Origin,diffX,diffY,Rad,Angle);
                        Intersections += this.CheckIfLineIntersectsArc([StartPosX,StartPosY],[EndPosX,EndPosY],Origin,Rad,StartAngle,EndAngle);
                    }
                }
                else{
                    if((Level +  state) % 2 == 0)
                        this.Segments[Level].SetMaxAngle();
                    else
                        this.Segments[Level].SetMinAngle();

                    //Start from the left upper corner
                    let SegEndPos = this.Segments[Level].GetNextXSegmentPos();
                    let Origin = this.Segments[Level].GetOrigins();
                    let diffX = SegEndPos[0] - Origin[0];
                    let diffY = SegEndPos[1] - Origin[1];
                    let Rad = Math.sqrt(diffX**2 + diffY**2);
                    let Angle = Math.atan2(diffY, diffX) / Math.PI * 180;
                    
                    let StartAngle = (Angle + (this.Segments[Level].Angle - this.Segments[Level].Min_Angle));
                    let EndAngle = (Angle - this.Segments[Level].Max_Angle + this.Segments[Level].Angle);

                    //console.log(StartAngle,EndAngle)

                    //console.log(SegEndPos,Origin,diffX,diffY,Rad,Angle);
                    Intersections += this.CheckIfLineIntersectsArc([StartPosX,StartPosY],[EndPosX,EndPosY],Origin,Rad,StartAngle,EndAngle);
                }
                
            }
            if(Level == MinLevel){
                this.LoadSegmentsAngles(Level, MinLevel, SegmentsAngles);
                //console.log("Segment Angles Loaded")
                //console.log(Intersections);
                
            }
            return Intersections;
        }
        CheckIfLineIntersectsArc(StartP,EndP,CircleC,Rad,StartAng,EndAng){
            
            let Intersections = 0;

            //(SEx² + SEy²) t² + 2 (SEx.CSx + SEy.CSy) t + CSx² + CSy² - R² = 0
            //discr = (2 (SEx.CSx + SEy.CSy))² - 4 * (SEx² + SEy²) * (CSx² + CSy² - R²)
            // t1,2 = (-(2 (SEx.CSx + SEy.CSy)) +- Sqrt(discr) ) / 2 * (SEx² + SEy²)


            //console.log(StartP,EndP,CircleC,Rad,StartAng,EndAng)
            let SE = [EndP[0] - StartP[0],EndP[1] - StartP[1]];
            let CS = [StartP[0] - CircleC[0],StartP[1] - CircleC[1]];
            let discr = (2 * (SE[0] * CS[0] + SE[1]*CS[1]))**2 - 4 * (SE[0]**2 + SE[1]**2) * (CS[0] ** 2 + CS[1] ** 2 - Rad ** 2);
            if(discr < 0){
                //If the discriminant is less than 0, it means there's no intersection between the line and the arc
                //That's an automatic 0 intersetion return
                //console.log(discr);
                return 0;
            }
            let t1 = (-(2 * (SE[0] * CS[0] + SE[1]*CS[1])) - Math.sqrt(discr)) / (2 * (SE[0]**2 + SE[1]**2));
            let t2 = (-(2 * (SE[0] * CS[0] + SE[1]*CS[1])) + Math.sqrt(discr)) / (2 * (SE[0]**2 + SE[1]**2));
            
            //To properly calculate with the angles
            //we need to to some pre checks and calculations

            StartAng %= 360;
            EndAng %= 360;

            if(Math.abs(StartAng) > 180){
                StartAng -= Math.sign(StartAng)*(Math.abs(StartAng) - 180) * 2;
                StartAng *= (-1);
            }

            if(Math.abs(EndAng) > 180){
                EndAng -= Math.sign(EndAng)*(Math.abs(EndAng) - 180) * 2;
                EndAng *= (-1);
            }

            StartAng = ConvertAngleToRightRange(StartAng);

            EndAng = ConvertAngleToRightRange(EndAng);

            if(EndAng < StartAng)
                EndAng += 360;

            if(t1 > 0 && t1 < 1){
                let X1 = StartP[0] + t1 * SE[0];
                let Y1 = StartP[1] + t1 * SE[1];

                
                let Ang1 = Math.atan2(Y1 - CircleC[1], X1 - CircleC[0]);
                Ang1 = (Ang1  / Math.PI * 180 );

                Ang1 = ConvertAngleToRightRange(Ang1);

                if(Ang1 < 180 && Ang1 < (EndAng - 360))
                    Ang1 += 360;

                if(Ang1 > StartAng && Ang1 < EndAng){
                    Intersections += 1;
                    // let Pt = new Point(X1,Y1,5,"I");
                    // Pt.Draw(40);
                } 
                //If discriminant is 0, it means there can only be one intersection
                //and if it's in the arc, we don't want to count it two times
                if(discr == 0)
                    return Intersections;
                
            }
            if(t2 > 0 && t2 < 1){

                let X2 = StartP[0] + t2 * SE[0];
                let Y2 = StartP[1] + t2 * SE[1];
        
                let Ang2 = Math.atan2(Y2 - CircleC[1], X2 - CircleC[0]);
                Ang2 = (Ang2  / Math.PI * 180 );
                
                Ang2 = ConvertAngleToRightRange(Ang2);

                if(Ang2 < 180 && Ang2 < (EndAng - 360))
                    Ang2 += 360;

                if(Ang2 > StartAng && Ang2 < EndAng){
                    Intersections += 1;

                    // let Pt = new Point(X2,Y2,5,"I");
                    // Pt.Draw(40);
                }  
            }
            return Intersections;
        }

        InverseKinematics(posx,posy){
            let XDif = posx - this.Segments[0].GetOrigins()[0];
            let YDif = posy - this.Segments[0].GetOrigins()[1];

            let Len0 = this.Segments[0].Length * this.Segments[0].Scale;
            let Len1 = this.Segments[1].Length * this.Segments[1].Scale;
            let Ang2 = Math.acos((Len0**2 + Len1**2 - XDif**2 - YDif**2) / (2 * Len0 * Len1));

            let Ang11 = -Math.atan(YDif / XDif);
            let Ang12 = Math.atan((Len1 * Math.sin(Math.PI - Ang2)) / (Len0 + Len1 * Math.cos(Math.PI - Ang2)));
                
            let Ang1 = Ang11 + Ang12;
            //console.log(Ang11,Ang12);

            //Converting angles
            Ang1 = Ang1 * 180 / Math.PI;
            Ang2 = Ang2 * 180 / Math.PI;

            this.Segments[0].SetAngle(Ang1);
            this.Segments[1].SetAngle(Ang2);
        }

        async MoveBetweenPoints(){

            for(let i = 0; i < this.Points.length - 1;i++){

                let Devisions = 10;

                let StartP = this.Points[i];
                let EndP = this.Points[i+1];

                let DiffX = EndP.posx - StartP.posx;
                let DiffY = EndP.posy - StartP.posy;

                //The distance squared, we don't need to calculate with the actual distance
                //so we can save the sqrt 

                //Normalizing the differences will give us a normal vector
                //we can use that to move the arm end point
                let Dist = Math.sqrt(DiffX**2 + DiffY**2);
                let NormalDiffX = DiffX / Dist;
                let NormalDiffY = DiffY / Dist;

                //How fast the robot arm should accelerate - decelerate
                let acc = this.Maxvel / this.tgy;
                //Current velocity
                let currVel = 0;


                //The Distance it takes to speed and and slow down
                let DistToSpeedUp = (0.5 * (acc) * this.tgy**2) * 100;
                let DistToSlowDown = (this.Maxvel - 0.5 * (acc) * this.tgy**2) * 100;


                let CurrX = 0;
                let CurrY = 0;
                //The current Distance from the point
                let MaxVelHere = this.Maxvel;
                
                let now = Date.now();
                
                //requestaniamationframe returns the current frame number, so we cant use that as a promise
                requestAnimationFrame(()=>this.moving(CurrX,CurrY,currVel,MaxVelHere,Dist,DistToSpeedUp,acc,NormalDiffX,NormalDiffY,StartP.posx,StartP.posy,now));
                await new Promise(()=>{
                    console.log("Called me.");
                }).then(console.log("Please work"));
                console.log("The program is here");
            }

            MovingBetweenPoints = MovingStates.STOPPED;
        }

        moving(CurrX,CurrY,currVel,MaxVelHere,Dist,DistToSpeedUp,acc,NormalDiffX,NormalDiffY,StartPX,StartPY,then){
           
            let CurrDist = Math.sqrt(CurrX**2 + CurrY**2);

            let now = Date.now();
            //Milliseconds -> Seconds
            let td = (now - then) / 1000;

            //Speeding up
            if((currVel < MaxVelHere) && (CurrDist < Dist / 2) && (CurrDist < DistToSpeedUp)){
                currVel += acc * td;
            }
            //Slowing down
            else if((CurrDist > Dist / 2) && (CurrDist > (Dist - DistToSpeedUp)) && (currVel > 0)){
                currVel -= acc * td;
            }

            if(currVel < 0){
                currVel = 0;
                console.log("Program exited");
                
                return true;
            }

            CurrX += (NormalDiffX * currVel) * 100 * td;
            CurrY += (NormalDiffY * currVel) * 100 * td;

            this.InverseKinematics(StartPX + CurrX,StartPY + CurrY);

            //If paused, it will stop and loop waiting for moving states
            if(MovingBetweenPoints == MovingStates.PAUSED){
                requestAnimationFrame(()=>{this.#paused(CurrX,CurrY,currVel,MaxVelHere,Dist,DistToSpeedUp,acc,NormalDiffX,NormalDiffY,StartPX,StartPY)});
            }
            //If moving, call this loop till end
            else if(MovingBetweenPoints == MovingStates.MOVING)
                requestAnimationFrame(()=>{this.moving(CurrX,CurrY,currVel,MaxVelHere,Dist,DistToSpeedUp,acc,NormalDiffX,NormalDiffY,StartPX,StartPY,now);});
            else{
                return false;
            }
            
            WhatToDraw(DrawList);
        
        }

        #paused(CurrX,CurrY,currVel,MaxVelHere,Dist,DistToSpeedUp,acc,NormalDiffX,NormalDiffY,StartPX,StartPY){
            //looping itself waiting for moving states
            if(MovingBetweenPoints == MovingStates.PAUSED){
                requestAnimationFrame(()=>{this.#paused(CurrX,CurrY,currVel,MaxVelHere,Dist,DistToSpeedUp,acc,NormalDiffX,NormalDiffY,StartPX,StartPY)});
                console.log("Looping here");
            }
            // //if states changed check if it's moving, else leave function and return
            else if(MovingBetweenPoints == MovingStates.MOVING){
                let now = Date.now();
                //this.moving(CurrX,CurrY,currVel,MaxVelHere,Dist,DistToSpeedUp,acc,NormalDiffX,NormalDiffY,StartPX,StartPY,now);
                requestAnimationFrame(()=>{this.moving(CurrX,CurrY,currVel,MaxVelHere,Dist,DistToSpeedUp,acc,NormalDiffX,NormalDiffY,StartPX,StartPY,now)});
            }
            else{
                return false;
            }
        }

    }