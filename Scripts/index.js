let canvas = document.querySelector('canvas');

    const Width = window.innerWidth;
    const Height = window.innerHeight;
    
    canvas.width = Width * 0.95;
    canvas.height = Height * 0.95;

    let ctx = canvas.getContext('2d');

    Origin_x = Width / 2 ;
    Origin_y = Height / 2 ;

    //Konstansok
    const First_Length = 1.2;
    const First_Min_Angle = 25;
    const First_Max_Angle = 90;
    const Second_Length = 0.9;
    const Second_Min_Angle = 45;
    const Second_Max_Angle = 135;
    //L3 , L4 , 32Min , 32Max , 43Min , 43 Max , tgy , v
    let RobotInfo = [1.2,0.9,25,90,45,135,0.5,1.2];

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
    //Arm.Segments[2] = Segment3;

    Arm.DrawWorkingArea(0);
    Arm.DrawAreaEnds();
    Arm.DrawRobotArms();
    Arm.DrawSmallCS();
    Arm.DrawRobotCS();
    Arm.DrawArmAngles();

    Segment1.SetText("L3");
    Segment1.DrawText();
    Segment1.DrawAngle(0);

    Segment2.SetText("L4");
    Segment2.DrawText();
    Segment2.DrawAngle(0);

    canvas.addEventListener("wheel",e=>{
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
        
        ClearScreen();

        Arm.DrawRobotArms();
        Arm.DrawSmallCS();
        Arm.DrawRobotCS();
        Arm.DrawWorkingArea(0);
        Arm.DrawAreaEnds();
    });
    canvas.addEventListener("mousedown",(e)=>{
        
        ctx.beginPath();
        ctx.strokeStyle = "black";
        ctx.moveTo(0,0);
        ctx.lineTo(e.clientX,e.clientY);
        ctx.stroke();
        ctx.closePath();

        Arm.SetPointsToMoveBetween(e.clientX,e.clientY);
        
    });

    canvas.addEventListener("mousemove",(e)=>{
        let res = Arm.CheckIfPointIsInSideWorkingArea(0,null,null,e.clientX,e.clientY);
        if(res % 2 == 1){
            Arm.InverseKinematics(e.clientX,e.clientY);
            ClearScreen();

            Arm.DrawRobotArms();
            Arm.DrawSmallCS();
            Arm.DrawRobotCS();
            Arm.DrawWorkingArea(0);
            Arm.DrawAreaEnds();
        }
    });


    let InputTR = document.querySelector("#VariableInputs").children;
    for(let i = 0; i < InputTR.length; i++){
        InputTR[i].children[0].addEventListener("wheel",(e)=>{
            let CurVal = (e.currentTarget.value);
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
            UpdateCanvas();
            
        });
        
    }


    UpdateCanvas = () =>{
        ClearScreen();

        Arm.DrawRobotArms();
        Arm.DrawSmallCS();
        Arm.DrawRobotCS();
        Arm.DrawWorkingArea(0);
        Arm.DrawAreaEnds();
    }

    UpdateRobotInfo = () =>{
        for(let i = 0; i < Arm.Segments.length;i++){
            Arm.Segments[i].Length = RobotInfo[i];
            Arm.Segments[i].Min_Angle = RobotInfo[i * 2 + 2];
            Arm.Segments[i].Max_Angle = RobotInfo[i * 2 + 3];
            Arm.Segments[i].UpdateSegments();
        }
    }


    





    


    


    



