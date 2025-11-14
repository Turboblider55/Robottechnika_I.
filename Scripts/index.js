let canvas = document.querySelector('canvas');

    const Width = window.innerWidth;
    const Height = window.innerHeight;
    
    canvas.width = Width;
    canvas.height = Height;

    let ctx = canvas.getContext('2d');

    Origin_x = Width / 2 ;
    Origin_y = Height / 2 ;

    //Konstansok
    //L3 , L4 , 32Min , 32Max , 43Min , 43 Max , tgy , v
    let RobotInfo = [1.2,0.9,25,90,45,135,0.5,1.2];

    let Divisions = 10;

    //Three states
    const MovingStates = {
        STOPPED: 0,
        MOVING: 1,
        PAUSED: 2
    }
    let MovingBetweenPoints = MovingStates.STOPPED;

    //A string of numbers relared to the checkboxes
    let DrawList = ""

    let SettingPoints = false;
    let PointStaysInside = true;

    let CS = new Coordinate_System(Width / 2,Height / 2,0);
    CS.DrawCS();
    
    let Segment1 = new Robot_Segment(CS,RobotInfo[0], RobotInfo[2], RobotInfo[2],RobotInfo[3]);
    let Segment2 = new Robot_Segment(CS,RobotInfo[1], RobotInfo[4], RobotInfo[4],RobotInfo[5]);
    //let Segment3 = new Robot_Segment(CS,Second_Length, Second_Min_Angle, Second_Min_Angle,Second_Max_Angle);
    
    Segment1.SetNextSegment(Segment2);
    Segment2.SetPrevSegment(Segment1);
    
    Arm = new Robot_Arm(CS);
    Arm.Segments[0] = Segment1;
    Arm.Segments[1] = Segment2;
    Arm.tgy = RobotInfo[RobotInfo.length - 2];
    Arm.Maxvel = RobotInfo[RobotInfo.length - 1];
    //Arm.Segments[2] = Segment3;

    Segment1.SetText("L3");
    Segment1.DrawText();
    Segment1.DrawAngle(0);

    Segment2.SetText("L4");
    Segment2.DrawText();
    Segment2.DrawAngle(0);

    canvas.addEventListener("wheel",e=>{
        if(MovingBetweenPoints == MovingStates.STOPPED){
            if(e.deltaY < 0){
                
                for(let i = 0; i < Arm.Segments.length; i++){
                    Arm.Segments[i].RotateAroundOrigin((Arm.Segments[i].Max_Angle - Arm.Segments[i].Min_Angle) / 10);
                }
    
                //console.log(Segment1.Angle)
            }
            else if(e.deltaY > 0){
                
                for(let i = 0; i < Arm.Segments.length; i++){
                    Arm.Segments[i].RotateAroundOrigin(-(Arm.Segments[i].Max_Angle - Arm.Segments[i].Min_Angle) / 10);
                }
            }
            
            WhatToDraw(DrawList);
        }
    });
    canvas.addEventListener("mousedown",(e)=>{
        if(MovingBetweenPoints == MovingStates.STOPPED){
            if(SettingPoints && PointStaysInside){
                Arm.SetPointsToMoveBetween(e.clientX,e.clientY);
                
                WhatToDraw(DrawList);
            }
        }

    });

    canvas.addEventListener("mousemove",(e)=>{
        //We shall only check there if we're not animating the Arm
        if(MovingBetweenPoints == MovingStates.STOPPED){
            let res = Arm.CheckIfPointIsInSideWorkingArea(0,null,null,0,0,e.clientX,e.clientY);
            if(res % 2 == 1){
                Arm.InverseKinematics(e.clientX,e.clientY);
                
                WhatToDraw(DrawList);
            }
            if(SettingPoints){
                if(Arm.Points.length > 0){
                    WhatToDraw(DrawList);
    
                    let LastPt = Arm.Points[Arm.Points.length-1];
                    ctx.beginPath();
                    ctx.setLineDash([10,10]);
                    let intersections = Arm.CheckIfPointIsInSideWorkingArea(0,null,null,LastPt.posx,LastPt.posy,e.clientX,e.clientY);
                    
                    if(intersections == 0){
                        PointStaysInside = true;
                        ctx.strokeStyle = "black";
                    }
                    else{
                        PointStaysInside = false;
                        ctx.strokeStyle = "red";
                    }
    
                    ctx.moveTo(LastPt.posx,LastPt.posy);
                    ctx.lineTo(e.clientX,e.clientY);
                    ctx.stroke();
                    ctx.closePath();
                }
            }
        }

    });

    //Input Variables
    let InputTR = document.querySelector("#VariableInputs").children;
    for(let i = 0; i < InputTR.length; i++){
        InputTR[i].children[0].addEventListener("wheel",(e)=>{
            if(e.deltaY < 0){
                if(i < 2 || i > 5){
                    RobotInfo[i] += 0.1;
                }
                else{
                    RobotInfo[i] += 1;
                }
            }
            else{
                if(i < 2 || i > 5){
                    RobotInfo[i] -= 0.1;
                    if(RobotInfo[i] < 0)
                        RobotInfo[i] = 0;
                }
                else{
                    RobotInfo[i] -= 1;
                }
            }
            if(i < 2 || i > 5)
                e.currentTarget.value = RobotInfo[i].toFixed(1);
            else
                e.currentTarget.value = `${RobotInfo[i]}°`;

            UpdateRobotInfo();
            WhatToDraw(DrawList);
            
        });
    }

    UpdateRobotInfo = () =>{
        for(let i = 0; i < Arm.Segments.length;i++){
            Arm.Segments[i].Length = RobotInfo[i];

            Arm.Segments[i].Min_Angle = RobotInfo[i * 2 + 2];
            if(Arm.Segments[i].Angle < RobotInfo[i * 2 + 2])
                Arm.Segments[i].SetMinAngle();

            Arm.Segments[i].Max_Angle = RobotInfo[i * 2 + 3];
            if(Arm.Segments[i].Angle > RobotInfo[i * 2 + 3])
                Arm.Segments[i].SetMaxAngle();

            Arm.Segments[i].UpdateSegments();
        }
        Arm.tgy = RobotInfo[RobotInfo.length - 2];
        Arm.Maxvel = RobotInfo[RobotInfo.length - 1];
    }

    //Checkboxes table -> tbody -> tr
    let Checkboxes = document.querySelector("#Checkboxes").children[0].children;
    for(let i = 0; i < Checkboxes.length;i++){
        let Checkbox = Checkboxes[i].children[0].children[0]
        Checkbox.addEventListener("click",(e)=>{
            if(Checkbox.checked){
                if(DrawList.indexOf(`${i}`) == -1)
                    DrawList += `${i}`;
            }
            else{
                DrawList = DrawList.replace(`${i}`,"");
            }

            WhatToDraw(DrawList);
        });
    }
    addEventListener("keydown",(e)=>{
        if(e.key == "Escape"){
            SettingPoints = false;
            WhatToDraw(DrawList);
        }
    });

    EndPointTable = (state) =>{
        let tbl = document.querySelector("#EndPointTbl").children[0];
        if(state){

            tbl.classList.remove("invisible");
            tbl.classList.add("visible");
            
            let Origins = Arm.Segments[0].GetOrigins();
            for(let i = 0; i < Arm.EndPoints.length;i++){
                tbl.deleteRow(Arm.EndPoints.length - i - 1);
                let tr = document.createElement("tr");
                let td = document.createElement("td");
                let p = document.createElement("p");
                let DiffX = ((Arm.EndPoints[i].posx - Origins[0]) / 100).toFixed(2);
                let DiffY = (-(Arm.EndPoints[i].posy - Origins[1]) / 100).toFixed(2);
                p.innerText = `${Arm.EndPoints[i].string} [ X : ${DiffX} | Y : ${DiffY} ]`;
                td.append(p);
                tr.append(td);
                tbl.append(tr);
            }
        }
        else{
            tbl.classList.remove("visible");
            tbl.classList.add("invisible");
        }
    }

    WhatToDraw = (string) =>{
        ClearScreen();
        EndPointTable(0);
        string.split("").forEach(num=>{
            let x = parseInt(num);
            switch(x){
                case 0:
                    Arm.DrawWorkingArea(0);
                    break;
                case 1:
                    Arm.DrawAreaEnds();
                    EndPointTable(1);
                    break;
                case 2:
                    Arm.DrawSmallCS();
                    break;
                case 3:
                    Arm.DrawBigCS();
                    break;
                case 4:
                    Arm.DrawRobotCS();
                    break;
                case 5:
                    Arm.DrawArmAngles();
                    break;

                default:
                    break;
            }
        });
        Arm.DrawRobotArms();
        Arm.DrawPointsToMoveBetween();
        Arm.DrawArmText();
        
    }

    WhatToDraw(DrawList);

    SetPoints = () => {
        SettingPoints = true;
    }
    DeletePoints = () => {
        if(MovingBetweenPoints == MovingStates.STOPPED){
            SettingPoints = false;
            Arm.Points = new Array();
            WhatToDraw(DrawList);
        }
    }

    

    Move = () =>{
        //If it's running, first we should stop it, then restart it.
        MovingBetweenPoints = MovingStates.MOVING;
        //For know this doesn't work, we only work with the first to point
        Arm.MoveBetweenPoints(Divisions);
    }
    Pause = () =>{
        if(MovingBetweenPoints == MovingStates.MOVING){
            MovingBetweenPoints = MovingStates.PAUSED;
            return;
        }
        if(MovingBetweenPoints == MovingStates.PAUSED){
            MovingBetweenPoints = MovingStates.MOVING;
            return;
        }
    }
    Stop = () =>{
        MovingBetweenPoints = MovingStates.STOPPED;
    }

    //Divisions
    let DivsInput = document.querySelector("#Divs");
    DivsInput.addEventListener("wheel",(e)=>{
        if(MovingBetweenPoints == MovingStates.STOPPED){
            if(e.deltaY < 0){
                if(Divisions < 10){
                    Divisions++;
                    DivsInput.value = Divisions;
                }
            }
            else {
                if(Divisions > 1){
                    Divisions--;
                    DivsInput.value = Divisions;
                }
            }
        }
    });

    DeleteDivsTbl = () =>{
        let tbl = document.querySelector("#ArmMovementData").children[1];
        for(let i = tbl.rows.length; i > 0;i--){
            tbl.deleteRow(i - i);
        }
    }

    AddToDivsTbl = (time,Angs,Coords) =>{
        let tbody = document.querySelector("#ArmMovementData").children[1];
        let Count = tbody.children.length;
        let tr = document.createElement("tr");
        let DivTd = document.createElement("td");
        DivTd.innerHTML = Count + 1;
        let DivTime = document.createElement("td");
        DivTime.innerText = time.toFixed(2)+" s";
        
        tr.append(DivTd);
        tr.append(DivTime);
        
        Coords.forEach(Coord=>{
            let CoordTd = document.createElement("td");
            CoordTd.innerText = `${Coord.toFixed(2)}`;
            tr.append(CoordTd);
        })

        Angs.forEach(ang=>{
            let AngTd = document.createElement("td");
            AngTd.innerText = `${ang.toFixed(2)}°`;
            tr.append(AngTd);
        })

        tbody.append(tr);
    }




    


    


    



